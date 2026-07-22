"use client";

import { type FormEvent, useState } from "react";

type FormStatus = "idle" | "submitting" | "success" | "error";

const inputClassName =
  "mt-2 w-full border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none transition focus:border-accent";

const labelClassName = "block text-sm text-muted";

export function ReviewForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(5);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      location: String(data.get("location") ?? ""),
      rating,
      body: String(data.get("body") ?? ""),
      website: String(data.get("website") ?? ""),
    };

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as {
        error?: string;
        message?: string;
        details?: { name?: string; message?: string };
      };

      if (!response.ok) {
        const detail =
          result.details?.name || result.details?.message
            ? ` (${[result.details.name, result.details.message].filter(Boolean).join(": ")})`
            : "";
        setError((result.error ?? "Something went wrong. Please try again.") + detail);
        // #region agent log
        fetch("http://127.0.0.1:7353/ingest/00b64773-dd08-4901-bc6e-90665c3b9b6d", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Debug-Session-Id": "ea782e",
          },
          body: JSON.stringify({
            sessionId: "ea782e",
            runId: "save-error",
            hypothesisId: "E",
            location: "ReviewForm.tsx:handleSubmit",
            message: "client received error",
            data: {
              status: response.status,
              error: result.error ?? null,
              details: result.details ?? null,
            },
            timestamp: Date.now(),
          }),
        }).catch(() => {});
        // #endregion
        setStatus("error");
        return;
      }

      form.reset();
      setRating(5);
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
