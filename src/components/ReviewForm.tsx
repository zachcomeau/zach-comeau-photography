"use client";

import { type FormEvent, useEffect, useState } from "react";
import { PHOTO_MAX_BYTES } from "@/lib/review-photo";

type FormStatus = "idle" | "submitting" | "success" | "error";

const inputClassName =
  "mt-2 w-full border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none transition focus:border-accent";

const labelClassName = "block text-sm text-muted";

export function ReviewForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);

  function clearPhoto() {
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoFile(null);
  }

  function handlePhotoChange(fileList: FileList | null) {
    const file = fileList?.[0] ?? null;
    if (!file) {
      clearPhoto();
      return;
    }

    if (file.type !== "image/jpeg" && file.type !== "image/png") {
      setError("Photo must be a JPG or PNG.");
      clearPhoto();
      return;
    }
    if (file.size > PHOTO_MAX_BYTES) {
      setError("Photo must be 3 MB or smaller.");
      clearPhoto();
      return;
    }

    setError(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("rating", String(rating));

    if (photoFile) {
      data.set("photo", photoFile);
    } else {
      data.delete("photo");
    }

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        body: data,
      });

      const result = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setError(result.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }

      form.reset();
      setRating(5);
      clearPhoto();
      setStatus("success");
    } catch {
      setError("Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="border-t border-border pt-8">
        <p className="text-base leading-7 text-muted">
          Thanks—your review will appear after approval.
        </p>
        <button
          type="button"
          onClick={() => setStatus("idle")}
          className="mt-6 inline-block border border-accent px-6 py-3 font-heading text-xs tracking-[0.14em] text-accent transition hover:bg-accent hover:text-background"
        >
          Write another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 border-t border-border pt-8">
      <div>
        <label htmlFor="review-name" className={labelClassName}>
          Name
        </label>
        <input
          id="review-name"
          name="name"
          type="text"
          required
          maxLength={80}
          autoComplete="name"
          className={inputClassName}
        />
      </div>

      <div>
        <label htmlFor="review-location" className={labelClassName}>
          Location <span className="text-muted/70">(optional)</span>
        </label>
        <input
          id="review-location"
          name="location"
          type="text"
          maxLength={80}
          placeholder="e.g. Vermont"
          autoComplete="address-level1"
          className={inputClassName}
        />
      </div>

      <fieldset>
        <legend className={labelClassName}>Rating</legend>
        <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Rating">
          {[1, 2, 3, 4, 5].map((value) => {
            const selected = rating === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setRating(value)}
                className={
                  selected
                    ? "border border-accent bg-accent px-3 py-2 font-heading text-xs tracking-[0.14em] text-background"
                    : "border border-border px-3 py-2 font-heading text-xs tracking-[0.14em] text-muted transition hover:border-accent hover:text-accent"
                }
              >
                {value}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div>
        <label htmlFor="review-body" className={labelClassName}>
          Your review
        </label>
        <textarea
          id="review-body"
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className={`${inputClassName} resize-y`}
        />
      </div>

      <div>
        <label htmlFor="review-photo" className={labelClassName}>
          Photo of your print <span className="text-muted/70">(optional)</span>
        </label>
        <p className="mt-1 text-sm text-muted">JPG or PNG, up to 3 MB. Share how it looks in your space.</p>
        <input
          id="review-photo"
          name="photo"
          type="file"
          accept="image/jpeg,image/png,.jpg,.jpeg,.png"
          onChange={(e) => handlePhotoChange(e.target.files)}
          className="mt-2 block w-full text-sm text-muted file:mr-4 file:border file:border-border file:bg-background file:px-3 file:py-2 file:font-heading file:text-xs file:tracking-[0.14em] file:text-muted"
        />
        {photoPreview ? (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photoPreview}
              alt="Selected print photo preview"
              className="max-h-64 w-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                clearPhoto();
                const input = document.getElementById("review-photo") as HTMLInputElement | null;
                if (input) input.value = "";
              }}
              className="mt-3 border border-border px-4 py-2 font-heading text-xs tracking-[0.14em] text-muted transition hover:border-accent hover:text-accent"
            >
              Remove photo
            </button>
          </div>
        ) : null}
      </div>

      {/* Honeypot — hidden from users */}
      <div className="absolute -left-[9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="review-website">Website</label>
        <input id="review-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {error ? <p className="text-sm text-foreground">{error}</p> : null}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="inline-block bg-accent px-6 py-3 font-heading text-xs tracking-[0.14em] text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
