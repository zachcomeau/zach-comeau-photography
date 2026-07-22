import { get, put } from "@vercel/blob";

export type Review = {
  id: string;
  name: string;
  location?: string;
  rating: number;
  body: string;
  approved: boolean;
  createdAt: string;
};

export type ReviewInput = {
  name: string;
  location?: string;
  rating: number;
  body: string;
  /** Honeypot — must be empty if present */
  website?: string;
};

const BLOB_PATH = "reviews.json";
const ACCESS = "private" as const;

const NAME_MAX = 80;
const LOCATION_MAX = 80;
const BODY_MAX = 2000;
const BODY_MIN = 10;

export class ReviewsNotConfiguredError extends Error {
  constructor() {
    super("Reviews storage is not configured.");
    this.name = "ReviewsNotConfiguredError";
  }
}

export class ReviewValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReviewValidationError";
  }
}

export function isReviewsConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

function assertConfigured(): void {
  if (!isReviewsConfigured()) {
    throw new ReviewsNotConfiguredError();
  }
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const response = new Response(stream);
  return response.text();
}

async function debugLog(
  hypothesisId: string,
  location: string,
  message: string,
  data: Record<string, unknown>,
) {
  // #region agent log
  const payload = {
    sessionId: "ea782e",
    runId: "save-error",
    hypothesisId,
    location,
    message,
    data,
    timestamp: Date.now(),
  };
  fetch("http://127.0.0.1:7353/ingest/00b64773-dd08-4901-bc6e-90665c3b9b6d", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": "ea782e",
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
  try {
    const { appendFileSync } = await import("node:fs");
    const { join } = await import("node:path");
    appendFileSync(join(process.cwd(), "debug-ea782e.log"), `${JSON.stringify(payload)}\n`);
  } catch {
    /* ignore */
  }
  // #endregion
}

function errorMeta(error: unknown): { name: string; message: string } {
  if (error instanceof Error) {
    return { name: error.name, message: error.message.slice(0, 300) };
  }
  return { name: "UnknownError", message: String(error).slice(0, 300) };
}

async function readAllReviews(): Promise<Review[]> {
  assertConfigured();

  try {
    const result = await get(BLOB_PATH, { access: ACCESS, useCache: false });
    // #region agent log
    await debugLog("C", "lib/reviews.ts:readAllReviews", "get result", {
      hasResult: Boolean(result),
      statusCode: result?.statusCode ?? null,
      hasStream: Boolean(result && result.statusCode === 200 && result.stream),
      access: ACCESS,
      path: BLOB_PATH,
    });
    // #endregion
    if (!result || result.statusCode !== 200 || !result.stream) {
      return [];
    }

    const text = await streamToText(result.stream);
    if (!text.trim()) return [];

    try {
      const parsed = JSON.parse(text) as unknown;
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(isReview);
    } catch {
      return [];
    }
  } catch (error) {
    // #region agent log
    await debugLog("C", "lib/reviews.ts:readAllReviews:catch", "get threw", errorMeta(error));
    // #endregion
    throw error;
  }
}

function isReview(value: unknown): value is Review {
  if (!value || typeof value !== "object") return false;
  const r = value as Record<string, unknown>;
  return (
    typeof r.id === "string" &&
    typeof r.name === "string" &&
    typeof r.rating === "number" &&
    typeof r.body === "string" &&
    typeof r.approved === "boolean" &&
    typeof r.createdAt === "string" &&
    (r.location === undefined || typeof r.location === "string")
  );
}

async function writeAllReviews(reviews: Review[]): Promise<void> {
  assertConfigured();

  try {
    // #region agent log
    await debugLog("A", "lib/reviews.ts:writeAllReviews:before", "put starting", {
      reviewCount: reviews.length,
      access: ACCESS,
      path: BLOB_PATH,
      tokenLength: process.env.BLOB_READ_WRITE_TOKEN?.length ?? 0,
      hasStoreId: Boolean(process.env.BLOB_STORE_ID),
      hasOidc: Boolean(process.env.VERCEL_OIDC_TOKEN),
    });
    // #endregion
    await put(BLOB_PATH, JSON.stringify(reviews, null, 2), {
      access: ACCESS,
      contentType: "application/json",
      allowOverwrite: true,
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
    });
    // #region agent log
    await debugLog("A", "lib/reviews.ts:writeAllReviews:after", "put succeeded", {
      reviewCount: reviews.length,
    });
    // #endregion
  } catch (error) {
    // #region agent log
    await debugLog("A", "lib/reviews.ts:writeAllReviews:catch", "put threw", errorMeta(error));
    // #endregion
    throw error;
  }
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function validateReviewInput(input: ReviewInput): Omit<Review, "id" | "approved" | "createdAt"> {
  if (input.website && input.website.trim()) {
    throw new ReviewValidationError("Invalid submission.");
  }

  const name = normalizeWhitespace(input.name ?? "");
  if (!name) throw new ReviewValidationError("Name is required.");
  if (name.length > NAME_MAX) {
    throw new ReviewValidationError(`Name must be ${NAME_MAX} characters or fewer.`);
  }

  let location: string | undefined;
  if (input.location != null && String(input.location).trim()) {
    location = normalizeWhitespace(String(input.location));
    if (location.length > LOCATION_MAX) {
      throw new ReviewValidationError(`Location must be ${LOCATION_MAX} characters or fewer.`);
    }
  }

  const rating = Number(input.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new ReviewValidationError("Rating must be a whole number from 1 to 5.");
  }

  const body = String(input.body ?? "").trim();
  if (body.length < BODY_MIN) {
    throw new ReviewValidationError(`Review must be at least ${BODY_MIN} characters.`);
  }
  if (body.length > BODY_MAX) {
    throw new ReviewValidationError(`Review must be ${BODY_MAX} characters or fewer.`);
  }

  return { name, location, rating, body };
}

export async function listReviews(): Promise<Review[]> {
  const reviews = await readAllReviews();
  return reviews.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function listApprovedReviews(): Promise<Review[]> {
  const reviews = await listReviews();
  return reviews.filter((r) => r.approved);
}

export async function addReview(input: ReviewInput): Promise<Review> {
  const validated = validateReviewInput(input);
  const reviews = await readAllReviews();

  const review: Review = {
    id: crypto.randomUUID(),
    ...validated,
    approved: false,
    createdAt: new Date().toISOString(),
  };

  reviews.push(review);
  await writeAllReviews(reviews);
  return review;
}

export async function setReviewApproved(id: string, approved: boolean): Promise<Review | null> {
  const reviews = await readAllReviews();
  const index = reviews.findIndex((r) => r.id === id);
  if (index === -1) return null;

  reviews[index] = { ...reviews[index], approved };
  await writeAllReviews(reviews);
  return reviews[index];
}
