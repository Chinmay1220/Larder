"use client";

export default function EmailSubscribe() {
  return (
    <div className="mt-2">
      <p className="text-sm text-(--color-text-muted) mb-4">Or get notified when Pro launches:</p>
      <form className="flex gap-3 max-w-sm mx-auto" onSubmit={(e) => e.preventDefault()}>
        <input
          type="email"
          placeholder="your@email.com"
          className="flex-1 px-4 py-2.5 rounded-xl border border-(--color-border) bg-(--color-card) text-sm text-(--color-text-primary) placeholder:text-(--color-text-faint) outline-none focus:border-(--color-brand) transition-colors"
        />
        <button
          type="submit"
          className="bg-(--color-brand) text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-(--color-brand-dark) transition-colors shrink-0"
        >
          Notify me
        </button>
      </form>
    </div>
  );
}
