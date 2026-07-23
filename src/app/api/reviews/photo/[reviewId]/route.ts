import { getReviewPhotoStream, isReviewsConfigured } from "@/lib/reviews";

type RouteContext = {
  params: Promise<{ reviewId: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!isReviewsConfigured()) {
    return new Response("Reviews are not configured.", { status: 503 });
  }

  const { reviewId } = await context.params;
  if (!reviewId) {
    return new Response("Not found.", { status: 404 });
  }

  try {
    const photo = await getReviewPhotoStream(reviewId);
    if (!photo) {
      return new Response("Not found.", { status: 404 });
    }

    return new Response(photo.stream, {
      status: 200,
      headers: {
        "Content-Type": photo.contentType,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    console.error("Failed to load review photo:", error);
    return new Response("Could not load photo.", { status: 500 });
  }
}
