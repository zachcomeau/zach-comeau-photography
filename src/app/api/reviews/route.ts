import { NextResponse } from "next/server";
import {
  ReviewsNotConfiguredError,
  ReviewValidationError,
  addReview,
  isReviewsConfigured,
  readValidatedPhoto,
  type ReviewInput,
} from "@/lib/reviews";

export async function POST(request: Request) {
  if (!isReviewsConfigured()) {
    return NextResponse.json(
      { error: "Reviews are not configured." },
      { status: 503 },
    );
  }

  const contentType = request.headers.get("content-type") ?? "";

  let input: ReviewInput;
  let photoFile: File | null = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const photo = form.get("photo");
      photoFile = photo instanceof File ? photo : null;
      input = {
        name: String(form.get("name") ?? ""),
        location: String(form.get("location") ?? ""),
        rating: Number(form.get("rating")),
        body: String(form.get("body") ?? ""),
        website: String(form.get("website") ?? ""),
      };
    } else {
      input = (await request.json()) as ReviewInput;
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const photo = await readValidatedPhoto(photoFile);
    const review = await addReview(input, photo);
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
