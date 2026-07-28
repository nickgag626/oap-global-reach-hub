"use client";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-4 py-16 text-center">
      <h1 className="text-xl font-semibold text-neutral-900">Something went wrong</h1>
      <p className="text-sm text-neutral-600">
        An unexpected error occurred. Try again — if it keeps happening, ping the hub owner.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-700"
      >
        Try again
      </button>
    </div>
  );
}
