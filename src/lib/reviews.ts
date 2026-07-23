import { get, put } from "@vercel/blob";
import {
  ALLOWED_PHOTO_TYPES,
  PHOTO_MAX_BYTES,
  type PhotoContentType,
} from "@/lib/review-photo";

export type { PhotoContentType } from "@/lib/review-photo";
export { PHOTO_MAX_BYTES, ALLOWED_PHOTO_TYPES } from "@/lib/review-photo";

export type Review = {
  id: string;
  name: string;
  location?: string;
  rating: number;
  body: string;
  approved: boolean;
  createdAt: string;
  photoPathname?: string;
  photoContentType?: PhotoContentType;
};

export type ReviewInput = {
  name: string;
  location?: string;
  rating: number;
  body: string;
  /** Honeypot — must be empty if present */
  website?: string;
};

export type ReviewPhotoInput = {
  data: ArrayBuffer;
  contentType: PhotoContentType;
  extension: "jpg" | "png";
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

/** Prefer the static RW token so local/dev works even when OIDC is project-enabled but not for development. */
function blobToken(): string {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) throw new ReviewsNotConfiguredError();
  return token;
}

async function streamToText(stream: ReadableStream<Uint8Array>): Promise<string> {
  const response = new Response(stream);
  return response.text();
}

async function readAllReviews(): Promise<Review[]> {
  assertConfigured();

  try {
    const result = await get(BLOB_PATH, {
      access: ACCESS,
      useCache: false,
      token: blobToken(),
    });
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
  } catch {
    // Missing blob or transient access error → start from empty for write path.
    return [];
  }
}

function isPhotoContentType(value: unknown): value is PhotoContentType {
  return value === "image/jpeg" || value === "image/png";
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
    (r.location === undefined || typeof r.location === "string") &&
    (r.photoPathname === undefined || typeof r.photoPathname === "string") &&
    (r.photoContentType === undefined || isPhotoContentType(r.photoContentType))
  );
}

async function writeAllReviews(reviews: Review[]): Promise<void> {
  assertConfigured();

  await put(BLOB_PATH, JSON.stringify(reviews, null, 2), {
    access: ACCESS,
    contentType: "application/json",
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
    token: blobToken(),
  });
}

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function validateReviewInput(
  input: ReviewInput,
): Omit<Review, "id" | "approved" | "createdAt" | "photoPathname" | "photoContentType"> {
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

/** Parse and validate a photo File; returns null if absent. */
export async function readValidatedPhoto(file: File | null | undefined): Promise<ReviewPhotoInput | null> {
  if (!file || file.size === 0) return null;

  if (!ALLOWED_PHOTO_TYPES.includes(file.type as PhotoContentType)) {
    throw new ReviewValidationError("Photo must be a JPG or PNG.");
  }
  if (file.size > PHOTO_MAX_BYTES) {
    throw new ReviewValidationError("Photo must be 3 MB or smaller.");
  }

  const contentType = file.type as PhotoContentType;
  const extension = contentType === "image/png" ? "png" : "jpg";
  const data = await file.arrayBuffer();

  if (data.byteLength > PHOTO_MAX_BYTES) {
    throw new ReviewValidationError("Photo must be 3 MB or smaller.");
  }

  return { data, contentType, extension };
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

export async function getReviewById(id: string): Promise<Review | null> {
  const reviews = await readAllReviews();
  return reviews.find((r) => r.id === id) ?? null;
}

export async function getReviewPhotoStream(
  reviewId: string,
): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string } | null> {
  const review = await getReviewById(reviewId);
  if (!review?.photoPathname) return null;

  const result = await get(review.photoPathname, {
    access: ACCESS,
    useCache: false,
    token: blobToken(),
  });
  if (!result || result.statusCode !== 200 || !result.stream) return null;

  return {
    stream: result.stream,
    contentType: review.photoContentType ?? "application/octet-stream",
  };
}

async function putReviewPhoto(id: string, photo: ReviewPhotoInput): Promise<string> {
  const pathname = `review-photos/${id}.${photo.extension}`;
  await put(pathname, photo.data, {
    access: ACCESS,
    contentType: photo.contentType,
    allowOverwrite: true,
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
    token: blobToken(),
  });
  return pathname;
}

export async function addReview(
  input: ReviewInput,
  photo?: ReviewPhotoInput | null,
): Promise<Review> {
  const validated = validateReviewInput(input);
  const reviews = await readAllReviews();
  const id = crypto.randomUUID();

  let photoPathname: string | undefined;
  let photoContentType: PhotoContentType | undefined;

  if (photo) {
    photoPathname = await putReviewPhoto(id, photo);
    photoContentType = photo.contentType;
  }

  const review: Review = {
    id,
    ...validated,
    approved: false,
    createdAt: new Date().toISOString(),
    photoPathname,
    photoContentType,
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
