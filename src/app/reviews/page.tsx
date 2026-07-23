import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ReviewForm } from "@/components/ReviewForm";

export const metadata: Metadata = {
  title: "Reviews",
};

export default function ReviewsPage() {
  return (
    <div className="relative mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        label="Reviews"
        title="Share your experience"
        description="Bought a print or worked with me on a project? I’d love to hear how it went — and you’re welcome to share a photo of the print in your space."
      />
      <ReviewForm />
    </div>
  );
}
