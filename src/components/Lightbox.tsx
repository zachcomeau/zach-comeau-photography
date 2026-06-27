"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import type { GalleryItem } from "@/data/gallery";

type LightboxProps = {
  items: GalleryItem[];
  initialIndex: number;
  onClose: () => void;
};

const SWIPE_THRESHOLD_PX = 50;

export function Lightbox({ items, initialIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(initialIndex);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const item = items[index];

  const goPrev = useCallback(() => {
    setIndex((current) => (current > 0 ? current - 1 : items.length - 1));
  }, [items.length]);

  const goNext = useCallback(() => {
    setIndex((current) => (current < items.length - 1 ? current + 1 : 0));
  }, [items.length]);

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.changedTouches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX) return;
    if (Math.abs(deltaX) < Math.abs(deltaY)) return;

    if (deltaX > 0) goPrev();
    else goNext();
  };

  useEffect(() => {
    setIndex(initialIndex);
  }, [initialIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, goPrev, goNext]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/90 p-4 sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 z-10 font-heading text-xs tracking-[0.14em] text-background/80 hover:text-background"
        aria-label="Close lightbox"
      >
        Close
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          goPrev();
        }}
        className="absolute left-2 top-1/2 z-10 -translate-y-1/2 px-3 py-2 font-heading text-xs tracking-[0.14em] text-background/80 hover:text-background sm:left-4"
        aria-label="Previous image"
      >
        Prev
      </button>

      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          goNext();
        }}
        className="absolute right-2 top-1/2 z-10 -translate-y-1/2 px-3 py-2 font-heading text-xs tracking-[0.14em] text-background/80 hover:text-background sm:right-4"
        aria-label="Next image"
      >
        Next
      </button>

      <div
        className="relative flex max-h-[85vh] w-full max-w-5xl flex-col"
        onClick={(event) => event.stopPropagation()}
      >
        <div
          className="relative mx-auto w-full touch-none"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {item.imageSrc ? (
            <div className="relative inline-block max-h-[70vh] w-full">
              <Image
                src={item.imageSrc}
                alt={item.altText ?? item.title}
                width={2500}
                height={1667}
                className="mx-auto max-h-[70vh] w-auto max-w-full object-contain"
                sizes="(max-width: 1024px) 100vw, 900px"
                priority
              />
              <span
                className="pointer-events-none absolute bottom-3 left-3 font-heading text-xs tracking-[0.2em] text-white opacity-25 mix-blend-difference"
                aria-hidden
              >
                ZC
              </span>
            </div>
          ) : (
            <div className="flex aspect-[4/3] items-center justify-center bg-muted/30 text-muted">
              Image not found — add {item.imageSrc ?? "image"} to public/
            </div>
          )}
        </div>

        <div className="mt-4 text-center text-background">
          <h2 className="font-heading text-lg tracking-[0.1em]">{item.title}</h2>
          {item.location ? (
            <p className="mt-1 text-sm text-background/70">{item.location}</p>
          ) : null}
          {item.caption ? (
            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-background/80">
              {item.caption}
            </p>
          ) : null}
          {item.inStore ? (
            <Link
              href={`/prints/${item.slug}`}
              className="mt-4 inline-block font-heading text-xs tracking-[0.14em] text-highlight hover:underline"
            >
              View print options
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
