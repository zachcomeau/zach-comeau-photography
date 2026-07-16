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
  stripeProductId?: string;
  active: boolean;
};

export type ResolvedShipping = {
  priceCents: number;
  stripePriceId: string;
};

function sortOfferings(offerings: ResolvedOffering[]): ResolvedOffering[] {
  return [...offerings].sort((a, b) => {
    if (a.priceCents !== b.priceCents) return a.priceCents - b.priceCents;
    return a.label.localeCompare(b.label);
  });
}

function resolveOffering(config: PrintOffering): ResolvedOffering {
  return {
    id: config.id,
    slug: config.slug,
    label: config.label,
    description: config.description,
    medium: config.medium,
    priceCents: config.priceCents,
    stripeProductId: config.stripeProductId,
    active: config.active,
  };
}

export { formatPrice } from "@/lib/format-price";

export function getResolvedOfferingsForSlug(slug: string): ResolvedOffering[] {
  return sortOfferings(getOfferingsForSlug(slug).map(resolveOffering));
}

async function resolveStripeShippingPrice(
  productId: string,
): Promise<{ priceCents: number; stripePriceId: string } | null> {
  const stripe = getStripe();
  if (!stripe || !productId) return null;

  try {
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
      priceCents: price.unit_amount,
      stripePriceId: price.id,
    };
  } catch (error) {
    console.error(`Failed to resolve Stripe shipping product ${productId}:`, error);
    return null;
  }
}

export async function getShippingPrice(): Promise<ResolvedShipping | null> {
  return resolveStripeShippingPrice(storeConfig.stripeShippingProductId);
}

export function getFromPricesBySlug(slugs: string[]): Record<string, number> {
  const offerings = getActiveOfferings();
  const pricesBySlug: Record<string, number> = {};

  for (const slug of slugs) {
    const prices = offerings
      .filter((offering) => offering.slug === slug)
      .map((offering) => offering.priceCents);

    if (prices.length > 0) {
      pricesBySlug[slug] = Math.min(...prices);
    }
  }

  return pricesBySlug;
}

export function validateCheckoutSelection(
  slug: string,
  offeringId: string,
): ResolvedOffering | null {
  const offering = getResolvedOfferingsForSlug(slug).find((entry) => entry.id === offeringId);
  return offering ?? null;
}
