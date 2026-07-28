import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { getAllStrategies } from "@/lib/content";
import { isRegion } from "@/lib/regions";
import { RegionBadgeList } from "@/components/region-badge";
import { StatusBadge } from "@/components/status-badge";
import { RegionFilter } from "@/components/region-filter";

export const metadata: Metadata = { title: "Strategies" };

export default async function StrategiesPage({
  searchParams,
}: {
  searchParams: Promise<{ region?: string }>;
}) {
  const { region: raw } = await searchParams;
  const region = isRegion(raw) ? raw : null;

  const strategies = getAllStrategies().filter(
    (s) => region === null || s.regions.includes(region),
  );

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h1 className="text-2xl font-bold tracking-tight text-neutral-900">Strategy sections</h1>
        <Suspense fallback={null}>
          <RegionFilter />
        </Suspense>
      </div>

      {strategies.length === 0 ? (
        <p className="text-neutral-600">No strategy sections cover this region yet.</p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {strategies.map((s) => (
            <li key={s.slug}>
              <div className="flex h-full flex-col rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400">
                <div className="flex items-start justify-between gap-2">
                  <Link
                    href={{
                      pathname: `/strategies/${s.slug}`,
                      query: region ? { region } : undefined,
                    }}
                    className="font-semibold text-neutral-900 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
                  >
                    {s.strategy_number}. {s.title}
                  </Link>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-2 text-sm text-neutral-600">{s.summary}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <RegionBadgeList regions={s.regions} />
                  <span className="text-xs text-neutral-500">Owner: {s.owner}</span>
                </div>
                <div className="mt-3 flex items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-sm">
                  <Link
                    href={{
                      pathname: `/strategies/${s.slug}`,
                      query: region ? { region } : undefined,
                    }}
                    className="font-medium text-blue-800 hover:underline"
                  >
                    Open section →
                  </Link>
                  <Link
                    href={`/contribute?section=${s.slug}`}
                    aria-label={`Contribute to ${s.title}`}
                    className="font-medium text-blue-800 hover:underline"
                  >
                    Contribute to this →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
