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
    // #region agent log
    const details =
      error instanceof Error
        ? { name: error.name, message: error.message.slice(0, 300) }
        : { name: "UnknownError", message: String(error).slice(0, 300) };
    fetch("http://127.0.0.1:7353/ingest/00b64773-dd08-4901-bc6e-90665c3b9b6d", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "ea782e",
      },
      body: JSON.stringify({
        sessionId: "ea782e",
        runId: "save-error",
        hypothesisId: "D",
        location: "api/reviews/route.ts:POST:catch",
        message: "addReview failed",
        data: details,
        timestamp: Date.now(),
      }),
    }).catch(() => {});
    try {
      const { appendFileSync } = await import("node:fs");
      const { join } = await import("node:path");
      appendFileSync(
        join(process.cwd(), "debug-ea782e.log"),
        `${JSON.stringify({
          sessionId: "ea782e",
          runId: "save-error",
          hypothesisId: "D",
          location: "api/reviews/route.ts:POST:catch",
          message: "addReview failed",
          data: details,
          timestamp: Date.now(),
        })}\n`,
      );
    } catch {
      /* ignore */
    }
    // #endregion
    console.error("Failed to add review:", error);
    return NextResponse.json(
      { error: "Could not save review.", details },
      { status: 500 },
    );
  }
}
