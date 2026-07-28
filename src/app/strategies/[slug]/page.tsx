import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getAllStrategies, getStrategy } from "@/lib/content";
import { isRegion, STRATEGY_SLUGS } from "@/lib/regions";
import { RegionBadgeList } from "@/components/region-badge";
import { StatusBadge } from "@/components/status-badge";
import { RegionFilter } from "@/components/region-filter";
import { SegmentedMarkdown } from "@/components/markdown";

export function generateStaticParams() {
  return STRATEGY_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = getStrategy(slug);
  return { title: doc?.title ?? "Strategy" };
}

export default async function StrategyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ region?: string }>;
}) {
  const [{ slug }, { region: rawRegion }] = await Promise.all([params, searchParams]);
  const doc = getStrategy(slug);
  if (!doc) notFound();
  const activeRegion = isRegion(rawRegion) ? rawRegion : null;

  const all = getAllStrategies();
  const idx = all.findIndex((s) => s.slug === doc.slug);
  const prev = idx > 0 ? all[idx - 1] : null;
  const next = idx < all.length - 1 ? all[idx + 1] : null;
  const regionQuery = activeRegion ? { region: activeRegion } : undefined;

  return (
    <article className="mx-auto max-w-3xl space-y-6">
      <header className="space-y-3 border-b border-neutral-200 pb-5">
        <p className="text-sm text-neutral-500">Strategy {doc.strategy_number} of 8</p>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{doc.title}</h1>
        <p className="text-neutral-700">{doc.summary}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-neutral-600">
          <StatusBadge status={doc.status} />
          <span>Owner: {doc.owner}</span>
          <span>Updated {doc.last_updated}</span>
          <RegionBadgeList regions={doc.regions} />
        </div>
        <Suspense fallback={null}>
          <RegionFilter />
        </Suspense>
      </header>

      <SegmentedMarkdown segments={doc.segments} activeRegion={activeRegion} />

      <nav aria-label="Strategy sections" className="flex justify-between border-t border-neutral-200 pt-5 text-sm">
        {prev ? (
          <Link
            href={{ pathname: `/strategies/${prev.slug}`, query: regionQuery }}
            className="font-medium text-blue-800 hover:underline"
          >
            ← {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link
            href={{ pathname: `/strategies/${next.slug}`, query: regionQuery }}
            className="font-medium text-blue-800 hover:underline"
          >
            {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
