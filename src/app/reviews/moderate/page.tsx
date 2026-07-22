import type { Metadata } from "next";
import { PageHeader } from "@/components/PageHeader";
import { ReviewsModerateClient } from "@/components/ReviewsModerateClient";

export const metadata: Metadata = {
  title: "Moderate reviews",
  robots: { index: false, follow: false },
};

export default function ReviewsModeratePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <PageHeader
        label="Admin"
        title="Moderate reviews"
        description="Approve or unpublish customer reviews. Bookmark this page — it is not linked in the site navigation."
      />
      <ReviewsModerateClient />
    </div>
  );
}
