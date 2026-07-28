import Link from "next/link";
import { getAllStrategies } from "@/lib/content";
import { RegionBadgeList } from "@/components/region-badge";
import { StatusBadge } from "@/components/status-badge";

export default function HomePage() {
  const strategies = getAllStrategies();

  return (
    <div className="space-y-10">
      <section className="max-w-3xl space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-neutral-900">
          Global Reach Resource Hub
        </h1>
        <p className="text-neutral-700">
          The single home for all Global Reach strategy outputs — localized talking points,
          success proof, and partner context for recruiting global customers to Oktane.
        </p>
        <div className="flex flex-wrap gap-3 pt-2">
          <Link
            href="/prep"
            className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
          >
            Prep a conversation →
          </Link>
          <Link
            href="/strategies"
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
          >
            Browse strategies
          </Link>
          <Link
            href="/contribute"
            className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
          >
            Contribute content
          </Link>
        </div>
      </section>

      <section aria-labelledby="sections-heading" className="space-y-4">
        <h2 id="sections-heading" className="text-xl font-semibold text-neutral-900">
          The 8 strategies
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {strategies.map((s) => (
            <li key={s.slug}>
              <Link
                href={`/strategies/${s.slug}`}
                className="block h-full rounded-lg border border-neutral-200 bg-white p-4 hover:border-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-700"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-semibold text-neutral-900">
                    {s.strategy_number}. {s.title}
                  </span>
                  <StatusBadge status={s.status} />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-neutral-600">{s.summary}</p>
                <div className="mt-3">
                  <RegionBadgeList regions={s.regions} />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
