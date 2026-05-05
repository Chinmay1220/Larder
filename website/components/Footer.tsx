export default function Footer() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-card) py-10 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <span className="font-[family-name:--font-display] text-lg text-(--color-text-primary)">
          🧺 Larder
        </span>

        <div className="flex gap-6 text-sm text-(--color-text-muted)">
          <a
            href="https://larder-theta.vercel.app"
            className="hover:text-(--color-text-primary) transition-colors"
          >
            App
          </a>
          <a href="/docs" className="hover:text-(--color-text-primary) transition-colors">
            Docs
          </a>
          <a
            href="https://github.com/Chinmay1220/Larder"
            className="hover:text-(--color-text-primary) transition-colors"
            target="_blank"
            rel="noopener noreferrer"
          >
            GitHub
          </a>
        </div>

        <span className="text-xs text-(--color-text-faint)">© 2026 Larder</span>
      </div>
    </footer>
  );
}
