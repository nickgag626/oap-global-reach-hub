"use client";

import { useState } from "react";
import Link from "next/link";
import { REGIONS, REGION_LABELS, type Region } from "@/lib/regions";

const inputCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700";
const labelCls = "block text-sm font-medium text-neutral-800";

type ViewState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "done" }
  | { kind: "error"; message: string; unprovisioned?: boolean };

export function ContributeForm({
  strategies,
  initialStrategySlug = "",
}: {
  strategies: { slug: string; title: string }[];
  initialStrategySlug?: string;
}) {
  const [name, setName] = useState("");
  const [strategySlug, setStrategySlug] = useState(initialStrategySlug);
  const [regions, setRegions] = useState<Region[]>([]);
  const [content, setContent] = useState("");
  const [links, setLinks] = useState<string[]>([""]);
  const [state, setState] = useState<ViewState>({ kind: "idle" });

  const toggleRegion = (r: Region) =>
    setRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]));

  const validationError = (): string | null => {
    if (!name.trim()) return "Add your name.";
    if (!strategySlug) return "Pick the strategy section this belongs to.";
    if (regions.length === 0) return "Tag at least one region.";
    if (content.trim().length < 10) return "Describe the content (at least 10 characters).";
    for (const l of links) {
      const v = l.trim();
      if (v && !/^https?:\/\/.+/.test(v)) return `"${v}" is not a valid http(s) link.`;
    }
    return null;
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const problem = validationError();
    if (problem) {
      setState({ kind: "error", message: problem });
      return;
    }
    setState({ kind: "submitting" });
    try {
      const res = await fetch("/api/contributions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedBy: name.trim(),
          strategySlug,
          regions,
          content: content.trim(),
          resourceLinks: links.map((l) => l.trim()).filter(Boolean),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.status === 201 && data?.ok) {
        setState({ kind: "done" });
      } else if (res.status === 503) {
        setState({
          kind: "error",
          unprovisioned: true,
          message:
            "The contribution store isn't provisioned yet. Ping the hub owner — your content is safe to submit once it's set up.",
        });
      } else {
        setState({ kind: "error", message: data?.error || `Submission failed (${res.status}).` });
      }
    } catch {
      setState({ kind: "error", message: "Network error — try again." });
    }
  }

  if (state.kind === "done") {
    return (
      <div
        role="status"
        className="rounded-lg border border-emerald-300 bg-emerald-50 p-5 text-emerald-900"
      >
        <p className="font-semibold">Thanks — your contribution is in the review queue. ✓</p>
        <p className="mt-1 text-sm">
          It will be reviewed and formatted into the appropriate strategy section.
        </p>
        <Link href="/tracker" className="mt-2 inline-block text-sm font-medium underline">
          View the tracker →
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5">
      <div className="space-y-1">
        <label htmlFor="c-name" className={labelCls}>
          Your name <span className="text-red-700">*</span>
        </label>
        <input
          id="c-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={120}
          required
          className={inputCls}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="c-strategy" className={labelCls}>
          Strategy section <span className="text-red-700">*</span>
        </label>
        <select
          id="c-strategy"
          value={strategySlug}
          onChange={(e) => setStrategySlug(e.target.value)}
          required
          className={inputCls}
        >
          <option value="">Select a section…</option>
          {strategies.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.title}
            </option>
          ))}
        </select>
      </div>

      <fieldset className="space-y-2">
        <legend className={labelCls}>
          Region(s) <span className="text-red-700">*</span>
        </legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">
          {REGIONS.map((r) => (
            <label key={r} className="inline-flex items-center gap-2 text-sm text-neutral-800">
              <input
                type="checkbox"
                checked={regions.includes(r)}
                onChange={() => toggleRegion(r)}
                className="h-4 w-4 rounded border-neutral-300"
              />
              {REGION_LABELS[r]}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="space-y-1">
        <label htmlFor="c-content" className={labelCls}>
          Content or summary <span className="text-red-700">*</span>
        </label>
        <textarea
          id="c-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          maxLength={5000}
          required
          placeholder="Paste the output itself, or a summary plus where to find it."
          className={inputCls}
        />
        <p className="text-xs text-neutral-500">{content.length}/5000</p>
      </div>

      <div className="space-y-2">
        <span className={labelCls}>Links to supporting materials</span>
        {links.map((l, i) => (
          <div key={i} className="flex gap-2">
            <input
              aria-label={`Supporting link ${i + 1}`}
              value={l}
              onChange={(e) =>
                setLinks((prev) => prev.map((x, j) => (j === i ? e.target.value : x)))
              }
              placeholder="https://…"
              className={inputCls}
            />
            {links.length > 1 && (
              <button
                type="button"
                aria-label={`Remove link ${i + 1}`}
                onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))}
                className="rounded-md border border-neutral-300 px-2 text-sm text-neutral-600 hover:bg-neutral-100"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        {links.length < 10 && (
          <button
            type="button"
            onClick={() => setLinks((prev) => [...prev, ""])}
            className="text-sm font-medium text-blue-800 hover:underline"
          >
            + Add another link
          </button>
        )}
      </div>

      <div aria-live="polite">
        {state.kind === "error" && (
          <p className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-900">
            {state.message}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={state.kind === "submitting"}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 disabled:cursor-not-allowed disabled:bg-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
      >
        {state.kind === "submitting" ? "Submitting…" : "Submit contribution"}
      </button>
    </form>
  );
}
