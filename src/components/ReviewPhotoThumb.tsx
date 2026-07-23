"use client";

import { useEffect, useState } from "react";

type ReviewPhotoThumbProps = {
  reviewId: string;
  alt?: string;
};

export function ReviewPhotoThumb({ reviewId, alt = "" }: ReviewPhotoThumbProps) {
  const [open, setOpen] = useState(false);
  const src = `/api/reviews/photo/${reviewId}`;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mb-6 block overflow-hidden text-left transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        aria-label="View print photo larger"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="h-[200px] w-[200px] object-cover" width={200} height={200} />
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Print photo"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 z-10 font-heading text-xs tracking-[0.14em] text-background/80 hover:text-background"
            aria-label="Close lightbox"
          >
            Close
          </button>

          <div
            className="relative max-h-[85vh] max-w-5xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
