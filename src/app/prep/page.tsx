import type { Metadata } from "next";
import { Suspense } from "react";
import { PrepForm } from "./prep-form";

export const metadata: Metadata = { title: "Conversation Prep" };

export default function PrepPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          AI Conversation Prep
        </h1>
        <p className="text-neutral-700">
          Pick a region, the customer&apos;s vertical, and the objection you&apos;re hearing —
          get localized talking points, a response, and a ready-to-send outreach draft. Output is
          grounded in the hub&apos;s content library only.
        </p>
      </header>
      <Suspense fallback={null}>
        <PrepForm />
      </Suspense>
    </div>
  );
}
