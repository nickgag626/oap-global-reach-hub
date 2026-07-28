import Link from "next/link";
import { Suspense } from "react";
import { Search } from "./search";

const LINKS = [
  { href: "/strategies", label: "Strategies" },
  { href: "/prep", label: "Conversation Prep" },
  { href: "/contribute", label: "Contribute" },
  { href: "/tracker", label: "Tracker" },
];

export function Nav({ pendingCount }: { pendingCount: number | null }) {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <nav
        aria-label="Main"
        className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3"
      >
        <Link href="/" className="text-base font-bold tracking-tight text-neutral-900">
          🌐 Global Reach Hub
        </Link>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {LINKS.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-sm font-medium text-neutral-700 hover:text-neutral-900"
              >
                {l.label}
                {l.href === "/tracker" && pendingCount ? (
                  <span
                    aria-label={`${pendingCount} pending contributions`}
                    className="ml-1.5 inline-flex min-w-5 items-center justify-center rounded-full bg-blue-700 px-1.5 py-0.5 text-xs font-semibold text-white"
                  >
                    {pendingCount}
                  </span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <div className="ml-auto">
          <Suspense fallback={null}>
            <Search />
          </Suspense>
        </div>
      </nav>
    </header>
  );
}
