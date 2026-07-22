import { NextResponse } from "next/server";
import {
  ReviewsNotConfiguredError,
  isReviewsConfigured,
  listReviews,
  setReviewApproved,
} from "@/lib/reviews";

function getAdminSecret(): string | null {
  return process.env.REVIEWS_ADMIN_SECRET ?? null;
}

function isAuthorized(request: Request): boolean {
  const secret = getAdminSecret();
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;
  return header.slice("Bearer ".length) === secret;
}

export async function GET(request: Request) {
  if (!getAdminSecret()) {
    return NextResponse.json(
      { error: "Moderation is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isReviewsConfigured()) {
    return NextResponse.json(
      { error: "Reviews are not configured." },
      { status: 503 },
    );
  }

  try {
    const reviews = await listReviews();
    return NextResponse.json({ reviews });
  } catch (error) {
    if (error instanceof ReviewsNotConfiguredError) {
      return NextResponse.json(
        { error: "Reviews are not configured." },
        { status: 503 },
      );
    }
    console.error("Failed to list reviews:", error);
    return NextResponse.json({ error: "Could not load reviews." }, { status: 500 });
  }
}

type ModerateBody = {
  id?: string;
  approved?: boolean;
};

export async function POST(request: Request) {
  if (!getAdminSecret()) {
    return NextResponse.json(
      { error: "Moderation is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!isReviewsConfigured()) {
    return NextResponse.json(
      { error: "Reviews are not configured." },
      { status: 503 },
    );
  }

  let body: ModerateBody;
  try {
    body = (await request.json()) as ModerateBody;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { id, approved } = body;
  if (!id || typeof id !== "string") {
    return NextResponse.json({ error: "Missing review id." }, { status: 400 });
  }
  if (typeof approved !== "boolean") {
    return NextResponse.json({ error: "Missing approved flag." }, { status: 400 });
  }

  try {
    const review = await setReviewApproved(id, approved);
    if (!review) {
      return NextResponse.json({ error: "Review not found." }, { status: 404 });
    }
    return NextResponse.json({ review });
  } catch (error) {
    if (error instanceof ReviewsNotConfiguredError) {
      return NextResponse.json(
        { error: "Reviews are not configured." },
        { status: 503 },
      );
    }
    console.error("Failed to moderate review:", error);
    return NextResponse.json({ error: "Could not update review." }, { status: 500 });
  }
}
