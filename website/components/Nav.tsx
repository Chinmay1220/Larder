export default function Nav() {
  return (
    <nav className="sticky top-0 z-40 backdrop-blur-sm bg-white/85 border-b border-(--color-border)">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a
          href="/"
          className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) hover:opacity-80 transition-opacity"
        >
          🧺 Larder
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm text-(--color-text-muted)">
          <a href="#how-it-works" className="hover:text-(--color-text-primary) transition-colors">
            How it works
          </a>
          <a href="#features" className="hover:text-(--color-text-primary) transition-colors">
            Features
          </a>
          <a href="#pricing" className="hover:text-(--color-text-primary) transition-colors">
            Pricing
          </a>
          <a href="/docs" className="hover:text-(--color-text-primary) transition-colors">
            Docs
          </a>
        </div>

        <a
          href="https://larder-theta.vercel.app"
          className="bg-(--color-brand) text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-(--color-brand-dark) transition-colors shadow-sm"
        >
          Get started free →
        </a>
      </div>
    </nav>
  );
}
