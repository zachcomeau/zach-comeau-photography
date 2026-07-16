"use client";

import { useEffect, useMemo, useState } from "react";
import type { ResolvedOffering, ResolvedShipping } from "@/lib/stripe-catalog";
import { formatPrice } from "@/lib/format-price";

type Medium = "print" | "canvas";

type PrintPurchasePanelProps = {
  slug: string;
  title: string;
  sku?: string;
  printNote?: string;
  offerings: ResolvedOffering[];
  shipping: ResolvedShipping | null;
  checkoutEnabled: boolean;
  shipsTo: string;
  turnaroundDays: string;
};

const MEDIUM_LABELS: Record<Medium, string> = {
  print: "Prints",
  canvas: "Canvas",
};

export function PrintPurchasePanel({
  slug,
  title,
  sku,
  printNote,
  offerings,
  shipping,
  checkoutEnabled,
  shipsTo,
  turnaroundDays,
}: PrintPurchasePanelProps) {
  const media = useMemo(() => {
    const set = new Set<Medium>();
    for (const offering of offerings) {
      set.add(offering.medium);
    }
    return (["print", "canvas"] as const).filter((medium) => set.has(medium));
  }, [offerings]);

  const [selectedMedium, setSelectedMedium] = useState<Medium | "">(media[0] ?? "");
  const [selectedId, setSelectedId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediumOfferings = useMemo(
    () =>
      offerings
        .filter((offering) => offering.medium === selectedMedium)
        .sort((a, b) => a.priceCents - b.priceCents),
    [offerings, selectedMedium],
  );

  useEffect(() => {
    if (!selectedMedium && media[0]) {
      setSelectedMedium(media[0]);
      return;
    }
    if (selectedMedium && !media.includes(selectedMedium)) {
      setSelectedMedium(media[0] ?? "");
    }
  }, [media, selectedMedium]);

  useEffect(() => {
    if (mediumOfferings.length === 0) {
      setSelectedId("");
      return;
    }
    if (!mediumOfferings.some((offering) => offering.id === selectedId)) {
      setSelectedId(mediumOfferings[0].id);
    }
  }, [mediumOfferings, selectedId]);

  const selectedOffering = useMemo(
    () => mediumOfferings.find((offering) => offering.id === selectedId) ?? mediumOfferings[0],
    [selectedId, mediumOfferings],
  );

  const totalCents =
    selectedOffering && shipping
      ? selectedOffering.priceCents + shipping.priceCents
      : selectedOffering?.priceCents ?? null;

  async function handleCheckout() {
    if (!selectedOffering || !checkoutEnabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug,
          offeringId: selectedOffering.id,
          stripePriceId: selectedOffering.stripePriceId,
        }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? "Checkout failed. Please try again.");
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Checkout failed. Please try again.",
      );
      setIsLoading(false);
    }
  }

  if (offerings.length === 0) {
    return (
      <div className="mt-8 border border-border bg-background p-6">
        <p className="text-sm text-muted">
          Print pricing is being configured. Email{" "}
          <a href="mailto:hello@zachcomeau.com" className="text-accent hover:underline">
            hello@zachcomeau.com
          </a>{" "}
          to order this print.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-8 border border-border bg-background p-6">
      {media.length > 1 ? (
        <>
          <p className="font-heading text-xs text-muted">Select medium</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {media.map((medium) => {
              const selected = selectedMedium === medium;
              return (
                <button
                  key={medium}
                  type="button"
                  onClick={() => setSelectedMedium(medium)}
                  aria-pressed={selected}
                  className={`border px-5 py-2.5 font-heading text-xs tracking-[0.14em] transition-colors ${
                    selected
                      ? "border-accent bg-accent text-background"
                      : "border-border text-foreground hover:border-accent"
                  }`}
                >
                  {MEDIUM_LABELS[medium]}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <p className={`font-heading text-xs text-muted ${media.length > 1 ? "mt-6" : ""}`}>
        Select size
      </p>
      <fieldset className="mt-4 space-y-2">
        {mediumOfferings.map((offering) => (
          <label
            key={offering.id}
            className="flex cursor-pointer items-center justify-between gap-4 border border-border px-4 py-3 has-checked:border-accent"
          >
            <span className="flex items-center gap-3">
              <input
                type="radio"
                name="print-size"
                value={offering.id}
                checked={selectedId === offering.id}
                onChange={() => setSelectedId(offering.id)}
                className="accent-accent"
              />
              <span className="text-sm text-foreground">{offering.label}</span>
            </span>
            <span className="text-sm text-muted">{formatPrice(offering.priceCents)}</span>
          </label>
        ))}
      </fieldset>

      {selectedOffering?.description ? (
        <p className="mt-4 text-sm leading-6 text-muted">{selectedOffering.description}</p>
      ) : printNote ? (
        <p className="mt-4 text-sm leading-6 text-muted">{printNote}</p>
      ) : (
        <p className="mt-4 text-sm leading-6 text-muted">
          Made to order from my original capture.
        </p>
      )}

      <dl className="mt-6 space-y-2 border-t border-border pt-4 text-sm text-muted">
        {shipping ? (
          <div className="flex justify-between">
            <dt>Shipping ({shipsTo})</dt>
            <dd>{formatPrice(shipping.priceCents)}</dd>
          </div>
        ) : null}
        {totalCents != null ? (
          <div className="flex justify-between text-foreground">
            <dt className="font-heading text-xs tracking-[0.12em]">Total</dt>
            <dd>{formatPrice(totalCents)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt>Turnaround</dt>
          <dd>{turnaroundDays} business days</dd>
        </div>
      </dl>

      {error ? <p className="mt-4 text-sm text-red-700">{error}</p> : null}

      {checkoutEnabled ? (
        <button
          type="button"
          onClick={handleCheckout}
          disabled={!selectedOffering || isLoading}
          className="mt-6 w-full bg-accent px-6 py-3 font-heading text-xs tracking-[0.14em] text-background transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? "Redirecting…" : `Buy print — ${title}`}
        </button>
      ) : (
        <button
          type="button"
          disabled
          className="mt-6 w-full cursor-not-allowed bg-border px-6 py-3 font-heading text-xs tracking-[0.14em] text-muted"
        >
          Buy print — coming soon
        </button>
      )}

      {sku ? (
        <p className="mt-3 font-heading text-[10px] tracking-[0.1em] text-muted">SKU {sku}</p>
      ) : null}
    </div>
  );
}
