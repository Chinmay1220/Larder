import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CounterStats from "@/components/CounterStats";
import TestimonialRotator from "@/components/TestimonialRotator";

// ── Inline mock UI components (replace with real screenshots later) ──────────

function MockBrowser({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-(--color-border) shadow-[0_8px_40px_rgba(0,0,0,0.10),0_2px_8px_rgba(0,0,0,0.06)] overflow-hidden bg-(--color-card)">
      <div className="bg-stone-50 border-b border-(--color-border) px-4 py-3 flex items-center gap-3">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-300" />
          <div className="w-3 h-3 rounded-full bg-amber-300" />
          <div className="w-3 h-3 rounded-full bg-green-300" />
        </div>
        <div className="flex-1 bg-stone-200/60 rounded-md h-4 max-w-[200px]" />
      </div>
      {children}
    </div>
  );
}

function MockPantryDashboard() {
  const items = [
    { name: "Blueberries", bar: "w-2/12", color: "bg-red-400", label: "Today" },
    { name: "Whole milk", bar: "w-5/12", color: "bg-amber-400", label: "3d left" },
    { name: "Gold potatoes", bar: "w-9/12", color: "bg-emerald-400", label: "18d left" },
    { name: "Cheddar cheese", bar: "w-7/12", color: "bg-emerald-400", label: "12d left" },
  ];
  return (
    <div className="bg-(--color-surface) p-4 space-y-3 select-none">
      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
        ⚠ Blueberries expiring today
      </div>
      <div className="flex gap-2">
        {["All", "Produce", "Dairy", "Pantry"].map((c) => (
          <span
            key={c}
            className="text-xs px-2.5 py-1 rounded-full border border-(--color-border) text-(--color-text-muted) bg-(--color-card)"
          >
            {c}
          </span>
        ))}
      </div>
      {items.map((item) => (
        <div
          key={item.name}
          className="bg-(--color-card) rounded-xl border border-(--color-border) px-3 py-2.5"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-sm font-medium text-(--color-text-primary)">{item.name}</span>
            <span className="text-xs text-(--color-text-faint)">{item.label}</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full ${item.bar} ${item.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function MockScanPage() {
  return (
    <div className="bg-(--color-surface) p-5 select-none">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-7 h-7 rounded-full bg-(--color-brand) text-white text-xs font-bold flex items-center justify-center">
          1
        </div>
        <div className="flex-1 h-0.5 bg-(--color-border)" />
        <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-400 text-xs font-bold flex items-center justify-center">
          2
        </div>
        <div className="flex-1 h-0.5 bg-(--color-border)" />
        <div className="w-7 h-7 rounded-full bg-stone-200 text-stone-400 text-xs font-bold flex items-center justify-center">
          3
        </div>
      </div>
      <div className="border-2 border-dashed border-(--color-brand-light) rounded-2xl p-6 text-center bg-(--color-brand-xlight)/40">
        <div className="text-3xl mb-2">📷</div>
        <p className="text-sm font-semibold text-(--color-text-primary) mb-1">
          Drop your receipt here
        </p>
        <p className="text-xs text-(--color-text-faint)">Image, PDF, Excel, Word, CSV or TXT</p>
      </div>
      <div className="mt-4 bg-(--color-brand) text-white text-sm font-semibold text-center py-2.5 rounded-xl">
        Process Receipt →
      </div>
    </div>
  );
}

function MockAlertsPage() {
  return (
    <div className="bg-(--color-surface) p-4 space-y-3 select-none">
      <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-medium">
        ⚠ 2 items expiring soon — Blueberries, Spinach
      </div>
      {[
        { name: "Blueberries", badge: "Expired", bar: "w-full", color: "bg-red-400", label: "2d ago" },
        { name: "Spinach", badge: "Today", bar: "w-1/12", color: "bg-red-400", label: "Today" },
        { name: "Greek yogurt", badge: null, bar: "w-4/12", color: "bg-amber-400", label: "2d left" },
      ].map((item) => (
        <div
          key={item.name}
          className="bg-(--color-card) rounded-xl border border-(--color-border) px-3 py-2.5"
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-(--color-text-primary)">{item.name}</span>
              {item.badge && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                  {item.badge}
                </span>
              )}
            </div>
            <span className="text-xs text-(--color-text-faint)">{item.label}</span>
          </div>
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div className={`h-1.5 rounded-full ${item.bar} ${item.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Data ──────────────────────────────────────────────────────────────────────

const steps = [
  {
    icon: "📸",
    title: "Snap your receipt",
    body: "Take a photo or upload a PDF. Larder reads every item with AI — no manual entry needed.",
  },
  {
    icon: "📦",
    title: "Pantry updates instantly",
    body: "Items land in your pantry with freshness bars and expiry dates calculated automatically.",
  },
  {
    icon: "🛒",
    title: "Shop smarter",
    body: "Get alerts before you leave home. Never buy duplicates. Never waste food again.",
  },
];

const freeFeatures = [
  "Unlimited receipt scans",
  "Up to 100 pantry items",
  "Expiry alerts + freshness bars",
  "Edit, delete, and quantity controls",
  "One user account",
];

const proFeatures = [
  "Everything in Free",
  "Multiple household members",
  "Email receipt sync",
  "Instacart integration",
  "Voice input: 'I just bought milk'",
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* ── Hero ── */}
        <section className="pt-20 pb-0 px-6 text-center bg-(--color-surface) overflow-hidden">
          <AnimatedSection className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-(--color-brand-xlight) text-(--color-brand) text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-(--color-brand-xlight)">
              <span>🧺</span>
              <span>Free pantry tracker</span>
            </div>

            <h1 className="font-[family-name:--font-display] text-5xl md:text-[68px] leading-[1.08] text-(--color-text-primary) mb-6 tracking-tight">
              Stop wasting groceries.
              <br />
              Start knowing your pantry.
            </h1>

            <p className="text-lg md:text-xl text-(--color-text-muted) max-w-xl mx-auto mb-10 leading-relaxed">
              Snap your receipt. Larder reads it, tracks your food, and warns you before you
              overbuy.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-14">
              <a
                href="https://larder-theta.vercel.app"
                className="bg-(--color-brand) text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-(--color-brand-dark) transition-colors shadow-sm"
              >
                Get started free →
              </a>
              <a
                href="#how-it-works"
                className="border border-(--color-border) text-(--color-text-muted) px-8 py-3.5 rounded-xl font-semibold text-base hover:text-(--color-text-primary) hover:border-(--color-text-muted) transition-colors"
              >
                See how it works ↓
              </a>
            </div>
          </AnimatedSection>

          {/* Hero mockup */}
          <AnimatedSection delay={200} className="max-w-3xl mx-auto">
            <MockBrowser>
              <MockPantryDashboard />
            </MockBrowser>
          </AnimatedSection>
        </section>

        {/* ── Stats bar ── */}
        <section className="py-8 px-6 border-y border-(--color-border) bg-(--color-card)">
          <CounterStats />
        </section>

        {/* ── Feature rows ── */}
        <section id="features" className="py-6">
          {/* Row 1 — mockup left, text right */}
          <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <AnimatedSection direction="left" className="order-1">
              <MockBrowser>
                <MockPantryDashboard />
              </MockBrowser>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={100} className="order-2">
              <p className="text-xs font-bold tracking-widest text-(--color-brand) uppercase mb-3">
                Pantry
              </p>
              <h2 className="font-[family-name:--font-display] text-4xl text-(--color-text-primary) mb-4 leading-tight">
                Always know what you have
              </h2>
              <p className="text-(--color-text-muted) leading-relaxed mb-6">
                Every receipt you scan updates your pantry automatically. Color-coded freshness bars
                show you what to use first — green for fresh, amber for soon, red for now.
              </p>
              <ul className="space-y-2.5">
                {["Freshness bars on every item", "Category filters", "Edit, delete, or decrement quantities"].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-(--color-text-muted)">
                      <span className="w-5 h-5 rounded-full bg-(--color-brand-xlight) text-(--color-brand) text-xs flex items-center justify-center shrink-0 font-bold">
                        ✓
                      </span>
                      {f}
                    </li>
                  )
                )}
              </ul>
            </AnimatedSection>
          </div>

          {/* Row 2 — text left, mockup right */}
          <div className="bg-(--color-card-warm)">
            <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
              <AnimatedSection direction="left" className="order-2 md:order-1">
                <p className="text-xs font-bold tracking-widest text-(--color-brand) uppercase mb-3">
                  Scanning
                </p>
                <h2 className="font-[family-name:--font-display] text-4xl text-(--color-text-primary) mb-4 leading-tight">
                  Snap. Done.
                </h2>
                <p className="text-(--color-text-muted) leading-relaxed mb-6">
                  Photograph a receipt or upload a PDF. Claude AI reads every item in seconds — no
                  manual entry, ever. Works with JPEG, PNG, PDF, Excel, Word, CSV and more.
                </p>
                <ul className="space-y-2.5">
                  {["AI reads any receipt format", "Results in under 15 seconds", "10 scans per minute, unlimited total"].map(
                    (f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-(--color-text-muted)">
                        <span className="w-5 h-5 rounded-full bg-(--color-brand-xlight) text-(--color-brand) text-xs flex items-center justify-center shrink-0 font-bold">
                          ✓
                        </span>
                        {f}
                      </li>
                    )
                  )}
                </ul>
              </AnimatedSection>
              <AnimatedSection direction="right" delay={100} className="order-1 md:order-2">
                <MockBrowser>
                  <MockScanPage />
                </MockBrowser>
              </AnimatedSection>
            </div>
          </div>

          {/* Row 3 — mockup left, text right */}
          <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
            <AnimatedSection direction="left" className="order-1">
              <MockBrowser>
                <MockAlertsPage />
              </MockBrowser>
            </AnimatedSection>
            <AnimatedSection direction="right" delay={100} className="order-2">
              <p className="text-xs font-bold tracking-widest text-(--color-brand) uppercase mb-3">
                Alerts
              </p>
              <h2 className="font-[family-name:--font-display] text-4xl text-(--color-text-primary) mb-4 leading-tight">
                Nothing slips to the back of the fridge
              </h2>
              <p className="text-(--color-text-muted) leading-relaxed mb-6">
                A red alert strip appears the moment something is about to expire. Expired items
                stay visible with a badge until you mark them used — nothing disappears silently.
              </p>
              <ul className="space-y-2.5">
                {["Red alert strip for upcoming expiries", "Expired badge stays visible", "Nightly expiry check runs automatically"].map(
                  (f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm text-(--color-text-muted)">
                      <span className="w-5 h-5 rounded-full bg-(--color-brand-xlight) text-(--color-brand) text-xs flex items-center justify-center shrink-0 font-bold">
                        ✓
                      </span>
                      {f}
                    </li>
                  )
                )}
              </ul>
            </AnimatedSection>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="py-24 px-6 bg-(--color-card) border-y border-(--color-border)">
          <div className="max-w-5xl mx-auto">
            <AnimatedSection>
              <h2 className="font-[family-name:--font-display] text-4xl text-center text-(--color-text-primary) mb-16">
                How it works
              </h2>
            </AnimatedSection>
            <div className="grid md:grid-cols-3 gap-8 relative">
              {/* Connecting line on desktop */}
              <div className="hidden md:block absolute top-9 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-(--color-border)" />
              {steps.map((step, i) => (
                <AnimatedSection key={i} delay={i * 150} className="flex flex-col items-center text-center relative">
                  <div className="w-12 h-12 rounded-full bg-(--color-brand) text-white font-bold flex items-center justify-center mb-5 shrink-0 z-10 shadow-sm text-lg">
                    {i + 1}
                  </div>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-(--color-text-primary) mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-(--color-text-muted) leading-relaxed">{step.body}</p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 px-6 bg-(--color-surface)">
          <div className="max-w-3xl mx-auto">
            <AnimatedSection>
              <h2 className="font-[family-name:--font-display] text-4xl text-center text-(--color-text-primary) mb-4">
                Simple, honest pricing
              </h2>
              <p className="text-center text-(--color-text-muted) mb-14">
                Start free. Upgrade when your household grows.
              </p>
            </AnimatedSection>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <AnimatedSection delay={100} className="bg-(--color-card) rounded-2xl border-2 border-(--color-brand) shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 flex flex-col relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-(--color-brand) text-white text-xs font-bold px-3 py-1 rounded-full">
                    MOST POPULAR
                  </span>
                </div>
                <div className="font-[family-name:--font-display] text-3xl text-(--color-text-primary) mb-1 mt-2">
                  Free
                </div>
                <div className="text-4xl font-bold text-(--color-text-primary) mb-6">
                  $0
                  <span className="text-base font-normal text-(--color-text-muted)">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-(--color-text-muted)">
                      <span className="w-5 h-5 rounded-full bg-(--color-brand-xlight) text-(--color-brand) text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://larder-theta.vercel.app"
                  className="block text-center bg-(--color-brand) text-white py-3 rounded-xl font-semibold text-sm hover:bg-(--color-brand-dark) transition-colors"
                >
                  Get started free →
                </a>
              </AnimatedSection>

              {/* Pro */}
              <AnimatedSection delay={200} className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8 flex flex-col opacity-60">
                <div className="inline-block bg-stone-100 text-stone-400 text-xs font-bold px-3 py-1 rounded-full mb-4 self-start tracking-wide">
                  COMING SOON
                </div>
                <div className="font-[family-name:--font-display] text-3xl text-(--color-text-primary) mb-1">
                  Pro
                </div>
                <div className="text-4xl font-bold text-(--color-text-primary) mb-6">
                  $5
                  <span className="text-base font-normal text-(--color-text-muted)">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-(--color-text-muted)">
                      <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  disabled
                  className="block w-full text-center bg-stone-100 text-stone-400 py-3 rounded-xl font-semibold text-sm cursor-not-allowed"
                >
                  Coming soon
                </button>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-24 px-6 bg-(--color-brand-xlight) border-t border-(--color-border)">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <p className="font-[family-name:--font-display] text-4xl md:text-5xl text-(--color-text-primary) mb-4 leading-snug">
                The average US household wastes{" "}
                <span className="text-(--color-brand)">$1,500 of food</span> every year.
              </p>
              <p className="text-(--color-text-muted) text-lg mb-10 max-w-md mx-auto">
                Larder helps you fix that — free.
              </p>
              <a
                href="https://larder-theta.vercel.app"
                className="inline-block bg-(--color-brand) text-white px-10 py-4 rounded-xl font-semibold text-base hover:bg-(--color-brand-dark) transition-colors shadow-sm mb-14"
              >
                Start saving food — it&apos;s free →
              </a>
            </AnimatedSection>

            <AnimatedSection delay={200}>
              <TestimonialRotator />
            </AnimatedSection>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
