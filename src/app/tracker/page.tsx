import type { Metadata } from "next";
import Link from "next/link";
import { getSectionStatuses } from "@/lib/content";
import { StatusBadge } from "@/components/status-badge";
import { ReviewQueue } from "./review-queue";

export const metadata: Metadata = { title: "Tracker" };
export const dynamic = "force-dynamic";

export default function TrackerPage() {
  const sections = getSectionStatuses();
  const counts = sections.reduce(
    (acc, s) => ({ ...acc, [s.status]: (acc[s.status] ?? 0) + 1 }),
    {} as Record<string, number>,
  );

  return (
    <div className="space-y-10">
      <section aria-labelledby="status-heading" className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h1 id="status-heading" className="text-2xl font-bold tracking-tight text-neutral-900">
            Progress tracker
          </h1>
          <p className="text-sm text-neutral-600">
            {counts["complete"] ?? 0} complete · {counts["in-progress"] ?? 0} in progress ·{" "}
            {counts["placeholder"] ?? 0} placeholder
          </p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50 text-left">
                <th scope="col" className="p-3 font-semibold text-neutral-700">
                  #
                </th>
                <th scope="col" className="p-3 font-semibold text-neutral-700">
                  Section
                </th>
                <th scope="col" className="p-3 font-semibold text-neutral-700">
                  Status
                </th>
                <th scope="col" className="hidden p-3 font-semibold text-neutral-700 sm:table-cell">
                  Owner
                </th>
                <th scope="col" className="hidden p-3 font-semibold text-neutral-700 sm:table-cell">
                  Updated
                </th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.slug} className="border-b border-neutral-100 last:border-0">
                  <td className="p-3 text-neutral-500">{s.strategy_number}</td>
                  <td className="p-3">
                    <Link
                      href={`/strategies/${s.slug}`}
                      className="font-medium text-blue-800 hover:underline"
                    >
                      {s.title}
                    </Link>
                  </td>
                  <td className="p-3">
                    <StatusBadge status={s.status} />
                  </td>
                  <td className="hidden p-3 text-neutral-600 sm:table-cell">{s.owner}</td>
                  <td className="hidden p-3 text-neutral-600 sm:table-cell">{s.last_updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="queue-heading" className="space-y-4">
        <h2 id="queue-heading" className="text-xl font-semibold text-neutral-900">
          Contribution review queue
        </h2>
        <ReviewQueue />
      </section>
    </div>
  );
}
