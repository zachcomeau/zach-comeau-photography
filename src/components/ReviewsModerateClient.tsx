"use client";

import { type FormEvent, useCallback, useEffect, useState, useSyncExternalStore } from "react";
import type { Review } from "@/lib/reviews";

const STORAGE_KEY = "reviews_admin_secret";

let cachedSecret = "";
const secretListeners = new Set<() => void>();

function readStoredSecret(): string {
  if (typeof window === "undefined") return "";
  return sessionStorage.getItem(STORAGE_KEY) ?? "";
}

function subscribeSecret(onStoreChange: () => void) {
  secretListeners.add(onStoreChange);
  return () => {
    secretListeners.delete(onStoreChange);
  };
}

function getSecretSnapshot() {
  return cachedSecret;
}

function getServerSecretSnapshot() {
  return "";
}

function setStoredSecret(value: string) {
  cachedSecret = value;
  if (typeof window !== "undefined") {
    if (value) sessionStorage.setItem(STORAGE_KEY, value);
    else sessionStorage.removeItem(STORAGE_KEY);
  }
  secretListeners.forEach((listener) => listener());
}

function hydrateSecretFromSession() {
  const stored = readStoredSecret();
  if (stored !== cachedSecret) {
    cachedSecret = stored;
    secretListeners.forEach((listener) => listener());
  }
}

function authHeaders(secret: string): HeadersInit {
  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

export function ReviewsModerateClient() {
  const secret = useSyncExternalStore(
    subscribeSecret,
    getSecretSnapshot,
    getServerSecretSnapshot,
  );
  const [inputSecret, setInputSecret] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const loadReviews = useCallback(async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/reviews/moderate", {
        headers: authHeaders(token),
      });
      const result = (await response.json()) as { reviews?: Review[]; error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not load reviews.");
        if (response.status === 401) {
          setStoredSecret("");
        }
        setReviews([]);
        return false;
      }
      setReviews(result.reviews ?? []);
      return true;
    } catch {
      setError("Could not load reviews.");
      setReviews([]);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    hydrateSecretFromSession();
    const token = readStoredSecret();
    if (!token) return;

    const timeoutId = window.setTimeout(() => {
      void loadReviews(token);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [hydrated, loadReviews]);

  async function handleUnlock(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = inputSecret.trim();
    if (!token) return;

    const ok = await loadReviews(token);
    if (ok) {
      setStoredSecret(token);
      setInputSecret("");
    }
  }

  function handleLock() {
    setStoredSecret("");
    setReviews([]);
    setError(null);
  }

  async function setApproved(id: string, approved: boolean) {
    if (!secret) return;
    setBusyId(id);
    setError(null);
    try {
      const response = await fetch("/api/reviews/moderate", {
        method: "POST",
        headers: authHeaders(secret),
        body: JSON.stringify({ id, approved }),
      });
      const result = (await response.json()) as { review?: Review; error?: string };
      if (!response.ok) {
        setError(result.error ?? "Could not update review.");
        return;
      }
      if (result.review) {
        setReviews((prev) =>
          prev.map((r) => (r.id === result.review!.id ? result.review! : r)),
        );
      }
    } catch {
      setError("Could not update review.");
    } finally {
      setBusyId(null);
    }
  }

  if (!hydrated) {
    return <p className="text-base text-muted">Loading…</p>;
  }

  if (!secret) {
    return (
      <form onSubmit={handleUnlock} className="max-w-md space-y-6 border-t border-border pt-8">
        <div>
          <label htmlFor="admin-secret" className="block text-sm text-muted">
            Admin secret
          </label>
          <input
            id="admin-secret"
            type="password"
            value={inputSecret}
            onChange={(e) => setInputSecret(e.target.value)}
            required
            autoComplete="current-password"
            className="mt-2 w-full border border-border bg-background px-3 py-2.5 text-base text-foreground outline-none transition focus:border-accent"
          />
        </div>
        {error ? <p className="text-sm text-foreground">{error}</p> : null}
        <button
          type="submit"
          disabled={loading}
          className="inline-block bg-accent px-6 py-3 font-heading text-xs tracking-[0.14em] text-background transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Checking…" : "Unlock"}
        </button>
      </form>
    );
  }

  const pending = reviews.filter((r) => !r.approved);
  const approved = reviews.filter((r) => r.approved);

  return (
    <div className="space-y-12 border-t border-border pt-8">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => void loadReviews(secret)}
          disabled={loading}
          className="border border-border px-4 py-2 font-heading text-xs tracking-[0.14em] text-muted transition hover:border-accent hover:text-accent disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
        <button
          type="button"
          onClick={handleLock}
          className="border border-border px-4 py-2 font-heading text-xs tracking-[0.14em] text-muted transition hover:border-accent hover:text-accent"
        >
          Lock
        </button>
      </div>

      {error ? <p className="text-sm text-foreground">{error}</p> : null}

      <ReviewGroup
        title="Pending"
        empty="No pending reviews."
        reviews={pending}
        busyId={busyId}
        onApprove={(id) => void setApproved(id, true)}
        onUnpublish={(id) => void setApproved(id, false)}
      />

      <ReviewGroup
        title="Approved"
        empty="No approved reviews yet."
        reviews={approved}
        busyId={busyId}
        onApprove={(id) => void setApproved(id, true)}
        onUnpublish={(id) => void setApproved(id, false)}
      />
    </div>
  );
}

function ReviewGroup({
  title,
  empty,
  reviews,
  busyId,
  onApprove,
  onUnpublish,
}: {
  title: string;
  empty: string;
  reviews: Review[];
  busyId: string | null;
  onApprove: (id: string) => void;
  onUnpublish: (id: string) => void;
}) {
  return (
    <section>
      <h2 className="font-heading text-xl text-foreground">{title}</h2>
      {reviews.length === 0 ? (
        <p className="mt-4 text-base text-muted">{empty}</p>
      ) : (
        <ul className="mt-6 space-y-8">
          {reviews.map((review) => (
            <li key={review.id} className="border-t border-border pt-6">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p className="font-heading text-sm text-foreground">{review.name}</p>
                {review.location ? (
                  <p className="text-sm text-muted">{review.location}</p>
                ) : null}
                <p className="text-sm text-muted">
                  {review.rating}/5 · {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
              <p className="mt-3 text-base leading-7 text-muted">{review.body}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                {!review.approved ? (
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => onApprove(review.id)}
                    className="bg-accent px-4 py-2 font-heading text-xs tracking-[0.14em] text-background transition hover:opacity-90 disabled:opacity-60"
                  >
                    Approve
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busyId === review.id}
                    onClick={() => onUnpublish(review.id)}
                    className="border border-border px-4 py-2 font-heading text-xs tracking-[0.14em] text-muted transition hover:border-accent hover:text-accent disabled:opacity-60"
                  >
                    Unpublish
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
