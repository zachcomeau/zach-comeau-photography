import { NextResponse } from "next/server";
import { getBySlug } from "@/data/gallery";
import { getStripe } from "@/lib/stripe";
import { getShippingPrice, validateCheckoutSelection } from "@/lib/stripe-catalog";

type CheckoutBody = {
  slug?: string;
  offeringId?: string;
  stripePriceId?: string;
};

function getSiteUrl(request: Request): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    request.headers.get("origin") ??
    "http://localhost:3000"
  );
}

export async function POST(request: Request) {
  const stripe = getStripe();
  if (!stripe) {
    return NextResponse.json({ error: "Checkout is not configured." }, { status: 503 });
  }

  let body: CheckoutBody;
  try {
    body = (await request.json()) as CheckoutBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { slug, offeringId, stripePriceId } = body;
  if (!slug || !offeringId || !stripePriceId) {
    return NextResponse.json({ error: "Missing checkout details." }, { status: 400 });
  }

  const item = getBySlug(slug);
  if (!item || !item.inStore) {
    return NextResponse.json({ error: "Print not found." }, { status: 404 });
  }

  const offering = await validateCheckoutSelection(slug, offeringId, stripePriceId);
  if (!offering || !offering.stripePriceId) {
    return NextResponse.json({ error: "Invalid print selection." }, { status: 400 });
  }

  const shipping = await getShippingPrice();
  if (!shipping) {
    return NextResponse.json({ error: "Shipping is not configured." }, { status: 503 });
  }

  const siteUrl = getSiteUrl(request);

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        { price: offering.stripePriceId, quantity: 1 },
        { price: shipping.stripePriceId, quantity: 1 },
      ],
      shipping_address_collection: {
        allowed_countries: ["US"],
      },
      metadata: {
        slug,
        offeringId,
        offeringLabel: offering.label,
        title: item.title,
        sku: item.sku ?? "",
        stripeProductId: offering.stripeProductId,
      },
      success_url: `${siteUrl}/prints/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/prints/cancelled`,
    });

    if (!session.url) {
      return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout session failed:", error);
    return NextResponse.json({ error: "Could not start checkout." }, { status: 500 });
  }
}
