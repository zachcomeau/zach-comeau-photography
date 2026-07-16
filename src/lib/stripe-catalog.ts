import type Stripe from "stripe";
import {
  getActiveOfferings,
  getOfferingsForSlug,
  storeConfig,
  type PrintOffering,
} from "@/data/products";
import { getStripe } from "@/lib/stripe";

export type ResolvedOffering = {
  id: string;
  slug: string;
  label: string;
  description: string;
  medium: "print" | "canvas";
  priceCents: number | null;
  stripePriceId: string | null;
  stripeProductId: string;
  active: boolean;
};

export type ResolvedShipping = {
  priceCents: number;
  stripePriceId: string;
};

async function resolveProductPrice(
  stripe: Stripe,
  productId: string,
): Promise<{ priceCents: number; stripePriceId: string } | null> {
  if (!productId || productId.startsWith("prod_placeholder")) return null;

  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });

    let price: Stripe.Price | null = null;
    const defaultPrice = product.default_price;

    if (typeof defaultPrice === "string") {
      price = await stripe.prices.retrieve(defaultPrice);
    } else if (defaultPrice && typeof defaultPrice === "object") {
      price = defaultPrice;
    }

    // Fallback: first active one-time price on the product
    if (!price || !price.active || price.unit_amount == null) {
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

    if (!price || !price.active || price.unit_amount == null) {
      console.error(
        `Stripe product ${productId} has no usable price — offering still shown without checkout.`,
      );
      return null;
    }

    return {
      priceCents: price.unit_amount,
      stripePriceId: price.id,
    };
  } catch (error) {
    console.error(`Failed to resolve Stripe product ${productId}:`, error);
    return null;
  }
}

function sortOfferings(offerings: ResolvedOffering[]): ResolvedOffering[] {
  return [...offerings].sort((a, b) => {
    if (a.priceCents == null && b.priceCents == null) return a.label.localeCompare(b.label);
    if (a.priceCents == null) return 1;
    if (b.priceCents == null) return -1;
    if (a.priceCents !== b.priceCents) return a.priceCents - b.priceCents;
    return a.label.localeCompare(b.label);
  });
}

async function attachStripePrices(configs: PrintOffering[]): Promise<ResolvedOffering[]> {
  const stripe = getStripe();

  const resolved = await Promise.all(
    configs.map(async (config) => {
      const price = stripe ? await resolveProductPrice(stripe, config.stripeProductId) : null;

      return {
        id: config.id,
        slug: config.slug,
        label: config.label,
        description: config.description,
        medium: config.medium,
        priceCents: price?.priceCents ?? null,
        stripePriceId: price?.stripePriceId ?? null,
        stripeProductId: config.stripeProductId,
        active: config.active,
      } satisfies ResolvedOffering;
    }),
  );

  return sortOfferings(resolved);
}

export { formatPrice } from "@/lib/format-price";

/** Always returns every active CSV offering for the slug — never drops rows if Stripe fails. */
export async function getResolvedOfferingsForSlug(slug: string): Promise<ResolvedOffering[]> {
  const configs = getOfferingsForSlug(slug);
  return attachStripePrices(configs);
}

export async function getShippingPrice(): Promise<ResolvedShipping | null> {
  const stripe = getStripe();
  if (!stripe) return null;

  const price = await resolveProductPrice(stripe, storeConfig.stripeShippingProductId);
  if (!price) return null;

  return price;
}

export async function getFromPricesBySlug(
  slugs: string[],
): Promise<Record<string, number>> {
  const offerings = await attachStripePrices(getActiveOfferings());
  const pricesBySlug: Record<string, number> = {};

  for (const slug of slugs) {
    const allowedIds = new Set(getOfferingsForSlug(slug).map((offering) => offering.id));
    const prices = offerings
      .filter((offering) => allowedIds.has(offering.id) && offering.priceCents != null)
      .map((offering) => offering.priceCents as number);

    if (prices.length > 0) {
      pricesBySlug[slug] = Math.min(...prices);
    }
  }

  return pricesBySlug;
}

export async function validateCheckoutSelection(
  slug: string,
  offeringId: string,
  stripePriceId: string,
): Promise<ResolvedOffering | null> {
  const offerings = await getResolvedOfferingsForSlug(slug);
  const offering = offerings.find(
    (entry) =>
      entry.id === offeringId &&
      entry.stripePriceId === stripePriceId &&
      entry.priceCents != null &&
      entry.stripePriceId != null,
  );

  return offering ?? null;
}
