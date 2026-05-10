import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t border-(--color-border) bg-(--color-card) py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <Image src="/logo.png" alt="Larder" width={100} height={32} className="h-8 w-auto mb-1" />
          <p className="text-sm text-(--color-text-faint)">Your kitchen&apos;s memory.</p>
        </div>

        <div className="flex gap-8 text-sm text-(--color-text-muted)">
          <a
            href="https://larder-theta.vercel.app"
            className="hover:text-(--color-text-primary) transition-colors"
          >
            App
          </a>
          <a href="/docs" className="hover:text-(--color-text-primary) transition-colors">
            Docs
          </a>
          <a href="/privacy" className="hover:text-(--color-text-primary) transition-colors">
            Privacy
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
