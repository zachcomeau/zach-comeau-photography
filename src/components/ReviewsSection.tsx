import Link from "next/link";
import { isReviewsConfigured, listApprovedReviews, type Review } from "@/lib/reviews";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="font-heading text-xs tracking-[0.14em] text-highlight" aria-label={`${rating} out of 5 stars`}>
      {"★".repeat(rating)}
      <span className="text-border">{"★".repeat(5 - rating)}</span>
    </span>
  );
}

function ReviewItem({ review }: { review: Review }) {
  return (
    <blockquote className="border-t border-border pt-8">
      <StarRating rating={review.rating} />
      <p className="mt-4 text-base leading-7 text-muted sm:text-lg sm:leading-8">
        “{review.body}”
      </p>
      <footer className="mt-4 text-sm text-foreground">
        <cite className="not-italic font-heading text-xs tracking-[0.14em]">{review.name}</cite>
        {review.location ? (
          <span className="text-muted"> · {review.location}</span>
        ) : null}
      </footer>
    </blockquote>
  );
}

export async function ReviewsSection() {
  if (!isReviewsConfigured()) {
    return null;
  }

  let reviews: Review[] = [];
  try {
    reviews = await listApprovedReviews();
  } catch (error) {
    console.error("Failed to load approved reviews:", error);
    return null;
  }

  if (reviews.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pb-20">
      <div className="mb-8">
        <p className="font-heading text-xs text-muted">Testimonials</p>
        <h2 className="font-heading mt-2 text-2xl text-foreground sm:text-3xl">Kind words</h2>
      </div>

      <div className="grid gap-10 sm:grid-cols-2">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/reviews"
          className="inline-block border border-accent px-6 py-3 font-heading text-xs tracking-[0.14em] text-accent transition hover:bg-accent hover:text-background"
        >
          Leave a review
        </Link>
      </div>
    </section>
  );
}
