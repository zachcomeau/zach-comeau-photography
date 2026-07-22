import { NextResponse } from "next/server";
import {
  ReviewsNotConfiguredError,
  ReviewValidationError,
  addReview,
  isReviewsConfigured,
  type ReviewInput,
} from "@/lib/reviews";

export async function POST(request: Request) {
  if (!isReviewsConfigured()) {
    return NextResponse.json(
      { error: "Reviews are not configured." },
      { status: 503 },
    );
  }

  let body: ReviewInput;
  try {
    body = (await request.json()) as ReviewInput;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const review = await addReview(body);
    return NextResponse.json(
      {
        id: review.id,
        message: "Thanks—your review will appear after approval.",
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ReviewValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (error instanceof ReviewsNotConfiguredError) {
      return NextResponse.json(
        { error: "Reviews are not configured." },
        { status: 503 },
      );
    }
    console.error("Failed to add review:", error);
    return NextResponse.json({ error: "Could not save review." }, { status: 500 });
  }
}
