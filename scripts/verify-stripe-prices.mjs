#!/usr/bin/env node
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function loadEnvFile(filename) {
  try {
    const text = readFileSync(join(root, filename), "utf8");
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const separator = trimmed.indexOf("=");
      if (separator === -1) continue;
      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim();
      if (!process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch {
    // optional file
  }
}

loadEnvFile(".env.local");

const secretKey = process.env.STRIPE_SECRET_KEY;
if (!secretKey) {
  console.error("Missing STRIPE_SECRET_KEY in .env.local");
  process.exit(1);
}

const stripe = new Stripe(secretKey);

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || (char === "\r" && next === "\n")) {
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }
      row = [];
      if (char === "\r") i++;
    } else if (char !== "\r") {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows;
}

async function resolvePrice(productId) {
  const product = await stripe.products.retrieve(productId, {
    expand: ["default_price"],
  });

  let price = product.default_price;
  if (typeof price === "string") {
    price = await stripe.prices.retrieve(price);
  }

  if (!price || typeof price === "string" || !price.active || price.unit_amount == null) {
    const listed = await stripe.prices.list({
      product: productId,
      active: true,
      limit: 10,
    });
    price =
      listed.data.find((entry) => entry.type === "one_time" && entry.unit_amount != null) ??
      listed.data.find((entry) => entry.unit_amount != null) ??
      null;
  }

  if (!price || price.unit_amount == null) return null;

  return {
    cents: price.unit_amount,
    priceId: price.id,
    productName: product.name,
  };
}

async function main() {
  const offeringsText = readFileSync(join(root, "data/printOfferings.csv"), "utf8");
  const configText = readFileSync(join(root, "data/storeConfig.csv"), "utf8");

  const offeringRows = parseCsv(offeringsText);
  const [offeringHeader, ...offeringData] = offeringRows;
  const offerings = offeringData
    .map((cells) =>
      Object.fromEntries(offeringHeader.map((key, index) => [key.trim(), (cells[index] ?? "").trim()])),
    )
    .filter((row) => row.id?.startsWith("prod_"));

  const configRows = parseCsv(configText);
  const [, ...configData] = configRows;
  const configMap = Object.fromEntries(configData.map((cells) => [cells[0], cells[1]]));

  const items = [
    ...offerings.map((row) => ({
      slug: row.filename,
      label: row.Label,
      productId: row.id,
    })),
    {
      slug: "shipping",
      label: "Shipping",
      productId: configMap.stripe_shipping_product_id,
    },
  ];

  let missing = 0;
  let errors = 0;

  for (const item of items) {
    try {
      const price = await resolvePrice(item.productId);
      if (!price) {
        missing++;
        console.log(`MISSING  ${item.slug} | ${item.label} | ${item.productId}`);
        continue;
      }

      console.log(
        `OK       ${item.slug} | ${item.label} | $${(price.cents / 100).toFixed(2)} | ${price.priceId} | ${price.productName}`,
      );
    } catch (error) {
      errors++;
      const message = error instanceof Error ? error.message : String(error);
      console.log(`ERROR    ${item.slug} | ${item.label} | ${item.productId} | ${message}`);
    }
  }

  console.log(`\nChecked ${items.length} products: ${items.length - missing - errors} ok, ${missing} missing price, ${errors} errors.`);

  if (missing > 0 || errors > 0) {
    process.exit(1);
  }
}

main();
