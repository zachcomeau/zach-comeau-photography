import { unstable_cache } from "next/cache";
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
  priceCents: number;
  stripePriceId: string;
  stripeProductId: string;
  active: boolean;
};

export type ResolvedShipping = {
  priceCents: number;
  stripePriceId: string;
};

function getDefaultPrice(product: Stripe.Product): Stripe.Price | null {
  const price = product.default_price;
  if (!price || typeof price === "string") return null;
  if (!price.active || price.unit_amount == null) return null;
  return price;
}

async function resolveProductPrice(
  stripe: Stripe,
  productId: string,
): Promise<{ priceCents: number; stripePriceId: string } | null> {
  if (!productId || productId.startsWith("prod_placeholder")) return null;

  try {
    const product = await stripe.products.retrieve(productId, {
      expand: ["default_price"],
    });
    const price = getDefaultPrice(product);
    if (!price || price.unit_amount == null) {
      console.error(
        `Stripe product ${productId} has no active default price — it will not appear on the site.`,
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

function sortByPrice(offerings: ResolvedOffering[]): ResolvedOffering[] {
  return [...offerings].sort((a, b) => a.priceCents - b.priceCents);
}

async function resolveOfferings(configs: PrintOffering[]): Promise<ResolvedOffering[]> {
  const stripe = getStripe();
  if (!stripe) return [];

  const resolved = await Promise.all(
    configs.map(async (config) => {
      const price = await resolveProductPrice(stripe, config.stripeProductId);
      if (!price) return null;

      return {
        id: config.id,
        slug: config.slug,
        label: config.label,
        description: config.description,
        medium: config.medium,
        priceCents: price.priceCents,
        stripePriceId: price.stripePriceId,
        stripeProductId: config.stripeProductId,
        active: config.active,
      } satisfies ResolvedOffering;
    }),
  );

  return sortByPrice(
    resolved.filter((offering): offering is ResolvedOffering => offering !== null),
  );
}

const getCachedActiveOfferings = unstable_cache(
  async () => resolveOfferings(getActiveOfferings()),
  ["stripe-active-offerings-v3"],
  { revalidate: 300 },
);

const getCachedShipping = unstable_cache(
  async (): Promise<ResolvedShipping | null> => {
    const stripe = getStripe();
    if (!stripe) return null;

    const price = await resolveProductPrice(stripe, storeConfig.stripeShippingProductId);
    if (!price) return null;

    return price;
  },
  ["stripe-shipping-price"],
  { revalidate: 300 },
);

export { formatPrice } from "@/lib/format-price";

export async function getResolvedOfferings(): Promise<ResolvedOffering[]> {
  return getCachedActiveOfferings();
}

export async function getResolvedOfferingsForSlug(slug: string): Promise<ResolvedOffering[]> {
  const allowedIds = new Set(getOfferingsForSlug(slug).map((offering) => offering.id));
  const offerings = await getCachedActiveOfferings();
  return sortByPrice(offerings.filter((offering) => allowedIds.has(offering.id)));
}

export async function getShippingPrice(): Promise<ResolvedShipping | null> {
  return getCachedShipping();
}

export async function getFromPricesBySlug(
  slugs: string[],
): Promise<Record<string, number>> {
  const offerings = await getCachedActiveOfferings();
  const pricesBySlug: Record<string, number> = {};

  for (const slug of slugs) {
    const allowedIds = new Set(getOfferingsForSlug(slug).map((offering) => offering.id));
    const prices = offerings
      .filter((offering) => allowedIds.has(offering.id))
      .map((offering) => offering.priceCents);

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
  return (
    offerings.find(
      (entry) => entry.id === offeringId && entry.stripePriceId === stripePriceId,
    ) ?? null
  );
}
