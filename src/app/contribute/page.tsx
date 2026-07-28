import type { Metadata } from "next";
import { getAllStrategies } from "@/lib/content";
import { ContributeForm } from "./contribute-form";

export const metadata: Metadata = { title: "Contribute" };

export default function ContributePage() {
  const strategies = getAllStrategies().map((s) => ({ slug: s.slug, title: s.title }));

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
          Contribute your strategy output
        </h1>
        <p className="text-neutral-700">
          Produced an ICP, blueprint, success story, or regional insight? Drop it here — no
          GitHub, no CMS. It lands in the review queue and gets formatted into the hub.
        </p>
      </header>
      <ContributeForm strategies={strategies} />
    </div>
  );
}
