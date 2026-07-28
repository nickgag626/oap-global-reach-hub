import type { SectionStatus } from "@/lib/regions";

const STYLES: Record<SectionStatus, { label: string; className: string }> = {
  placeholder: { label: "Placeholder", className: "bg-neutral-200 text-neutral-800" },
  "in-progress": { label: "In progress", className: "bg-amber-100 text-amber-900" },
  complete: { label: "Complete", className: "bg-emerald-100 text-emerald-900" },
};

export function StatusBadge({ status }: { status: SectionStatus }) {
  const s = STYLES[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${s.className}`}
    >
      {s.label}
    </span>
  );
}
