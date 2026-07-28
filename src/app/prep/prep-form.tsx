"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  OBJECTIONS,
  OBJECTION_LABELS,
  REGIONS,
  REGION_LABELS,
  VERTICALS,
  VERTICAL_LABELS,
  isRegion,
} from "@/lib/regions";
import { CopyButton } from "@/components/copy-button";
import { Spinner } from "@/components/spinner";

interface PrepResult {
  talkingPoints: string[];
  objectionResponse: string;
  outreachDraft: string;
  sources: string[];
}

type ViewState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "result"; result: PrepResult }
  | { kind: "fallback"; message: string }
  | { kind: "error"; message: string; timeout?: boolean };

const OTHER = "__other__";

const selectCls =
  "w-full rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-okta-500";
const labelCls = "block text-sm font-medium text-neutral-800";

export function PrepForm() {
  const searchParams = useSearchParams();
  const initialObjection = searchParams.get("objection");
  const initialVertical = searchParams.get("vertical");
  const initialRegion = searchParams.get("region");

  const [region, setRegion] = useState<string>(isRegion(initialRegion) ? initialRegion : "");
  const [vertical, setVertical] = useState<string>(
    (VERTICALS as readonly string[]).includes(initialVertical ?? "") ? initialVertical! : "",
  );
  const [objection, setObjection] = useState<string>(
    (OBJECTIONS as readonly string[]).includes(initialObjection ?? "") ? initialObjection! : "",
  );
  const [freeText, setFreeText] = useState("");
  const [state, setState] = useState<ViewState>({ kind: "idle" });

  const canSubmit =
    region !== "" && (objection === OTHER ? freeText.trim().length > 0 : objection !== "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit || state.kind === "loading") return;
    setState({ kind: "loading" });
    try {
      const res = await fetch("/api/prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          region,
          ...(vertical ? { vertical } : {}),
          ...(objection === OTHER ? { freeText: freeText.trim() } : { objection }),
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.ok && data.result) {
        setState({ kind: "result", result: data.result });
      } else if (res.ok && data?.reason === "insufficient_context") {
        setState({ kind: "fallback", message: data.message });
      } else {
        setState({
          kind: "error",
          timeout: res.status === 504,
          message:
            res.status === 504
              ? "That took too long — try again."
              : data?.error || `Request failed (${res.status}).`,
        });
      }
    } catch {
      setState({ kind: "error", message: "Network error — try again." });
    }
  }

  const allText =
    state.kind === "result"
      ? [
          "Talking points:",
          ...state.result.talkingPoints.map((t) => `- ${t}`),
          "",
          "Objection response:",
          state.result.objectionResponse,
          "",
          "Outreach draft:",
          state.result.outreachDraft,
        ].join("\n")
      : "";

  return (
    <div className="space-y-6">
      <form
        onSubmit={submit}
        className="space-y-4 rounded-lg border border-neutral-200 bg-white p-5"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label htmlFor="prep-region" className={labelCls}>
              Region <span className="text-red-700">*</span>
            </label>
            <select
              id="prep-region"
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className={selectCls}
            >
              <option value="">Select a region…</option>
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {REGION_LABELS[r]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="prep-vertical" className={labelCls}>
              Customer vertical
            </label>
            <select
              id="prep-vertical"
              value={vertical}
              onChange={(e) => setVertical(e.target.value)}
              className={selectCls}
            >
              <option value="">Any / not sure</option>
              {VERTICALS.map((v) => (
                <option key={v} value={v}>
                  {VERTICAL_LABELS[v]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="prep-objection" className={labelCls}>
            Objection / scenario <span className="text-red-700">*</span>
          </label>
          <select
            id="prep-objection"
            required
            value={objection}
            onChange={(e) => setObjection(e.target.value)}
            className={selectCls}
          >
            <option value="">Select a scenario…</option>
            {OBJECTIONS.map((o) => (
              <option key={o} value={o}>
                {OBJECTION_LABELS[o]}
              </option>
            ))}
            <option value={OTHER}>Other / describe it…</option>
          </select>
        </div>

        {objection === OTHER && (
          <div className="space-y-1">
            <label htmlFor="prep-freetext" className={labelCls}>
              Describe the scenario
            </label>
            <textarea
              id="prep-freetext"
              value={freeText}
              onChange={(e) => setFreeText(e.target.value)}
              maxLength={500}
              rows={3}
              placeholder='e.g. "Customer says their team is too small to justify sending anyone"'
              className={selectCls}
            />
            <p className="text-xs text-neutral-500">{freeText.length}/500</p>
          </div>
        )}

        <button
          type="submit"
          disabled={!canSubmit || state.kind === "loading"}
          className="rounded-md bg-okta-600 px-4 py-2 text-sm font-semibold text-white hover:bg-okta-700 disabled:cursor-not-allowed disabled:bg-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-okta-500"
        >
          {state.kind === "loading" ? "Preparing…" : "Prep my conversation"}
        </button>
      </form>

      <div aria-live="polite" className="space-y-4">
        {state.kind === "loading" && (
          <div className="flex justify-center py-6">
            <Spinner label="Preparing your talking points…" />
          </div>
        )}

        {state.kind === "fallback" && (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">No matching content yet</p>
            <p className="mt-1">{state.message}</p>
            <Link href="/contribute" className="mt-2 inline-block font-medium underline">
              Contribute content →
            </Link>
          </div>
        )}

        {state.kind === "error" && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-900">
            <p className="font-semibold">{state.timeout ? "Timed out" : "Something went wrong"}</p>
            <p className="mt-1">{state.message}</p>
            <button
              type="button"
              onClick={(e) =>
                submit(e as unknown as React.FormEvent)
              }
              className="mt-2 rounded-md border border-red-300 bg-white px-3 py-1 text-sm font-medium hover:bg-red-100"
            >
              Retry
            </button>
          </div>
        )}

        {state.kind === "result" && (
          <div className="space-y-4">
            <section className="rounded-lg border border-neutral-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-semibold text-neutral-900">Talking points</h2>
                <CopyButton
                  text={state.result.talkingPoints.map((t) => `- ${t}`).join("\n")}
                />
              </div>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-neutral-800">
                {state.result.talkingPoints.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-semibold text-neutral-900">Objection response</h2>
                <CopyButton text={state.result.objectionResponse} />
              </div>
              <p className="whitespace-pre-wrap text-sm text-neutral-800">
                {state.result.objectionResponse}
              </p>
            </section>

            <section className="rounded-lg border border-neutral-200 bg-white p-5">
              <div className="mb-3 flex items-center justify-between gap-2">
                <h2 className="font-semibold text-neutral-900">Outreach draft</h2>
                <CopyButton text={state.result.outreachDraft} />
              </div>
              <p className="whitespace-pre-wrap text-sm text-neutral-800">
                {state.result.outreachDraft}
              </p>
            </section>

            <div className="flex items-center justify-between gap-2">
              {state.result.sources.length > 0 ? (
                <p className="text-xs text-neutral-500">
                  Sources: {state.result.sources.join(" · ")}
                </p>
              ) : (
                <span />
              )}
              <CopyButton text={allText} label="Copy all" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
