import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import AnimatedSection from "@/components/AnimatedSection";
import CounterStats from "@/components/CounterStats";
import TestimonialRotator from "@/components/TestimonialRotator";
import TabbedFeatures from "@/components/TabbedFeatures";
import FaqAccordion from "@/components/FaqAccordion";
import EmailSubscribe from "@/components/EmailSubscribe";

// ── Mock UIs for hero cards ───────────────────────────────────────────────────

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
      <div className="flex gap-2 flex-wrap">
        {["All", "Produce", "Dairy", "Pantry"].map((c) => (
          <span key={c} className="text-xs px-2.5 py-1 rounded-full border border-(--color-border) text-(--color-text-muted) bg-(--color-card)">{c}</span>
        ))}
      </div>
      {items.map((item) => (
        <div key={item.name} className="bg-(--color-card) rounded-xl border border-(--color-border) px-3 py-2.5">
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
        <div key={item.name} className="bg-(--color-card) rounded-xl border border-(--color-border) px-3 py-2.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-(--color-text-primary)">{item.name}</span>
              {item.badge && (
                <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">{item.badge}</span>
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

const tickerItems = [
  "📦 Pantry tracking",
  "📸 AI receipt scanning",
  "🔔 Expiry alerts",
  "✅ 100% free to start",
  "⚡ Set up in 2 minutes",
  "🤖 Powered by Claude AI",
  "📊 Freshness bars",
  "🛒 Shop smarter",
  "🧾 Any receipt format",
  "🏠 For every household",
];

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
      {/* Announcement bar */}
      <div className="bg-(--color-brand) text-white text-center text-xs font-medium py-2.5 px-6">
        🎉 Larder is completely free to start — no credit card needed.{" "}
        <a href="https://larder-theta.vercel.app" className="underline font-semibold hover:opacity-80 transition-opacity">
          Get started →
        </a>
      </div>

      <Nav />

      <main>
        {/* ── Hero ── */}
        <section className="pt-14 pb-0 px-6 bg-(--color-surface) overflow-hidden">
          <AnimatedSection className="text-center max-w-4xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 bg-(--color-brand-xlight) text-(--color-brand) text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-(--color-brand-xlight)">
              <span>🧺</span>
              <span>Free pantry tracker</span>
            </div>
            <h1 className="font-[family-name:--font-display] text-5xl md:text-[68px] leading-[1.08] text-(--color-text-primary) mb-5 tracking-tight">
              Stop wasting groceries.
              <br />
              Start knowing your pantry.
            </h1>
            <p className="text-lg text-(--color-text-muted) max-w-lg mx-auto">
              Snap your receipt. Larder reads it, tracks your food, and warns you before you overbuy.
            </p>
          </AnimatedSection>

          {/* Two hero cards */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-5">
            <AnimatedSection direction="left" className="bg-(--color-brand-xlight) rounded-3xl p-8 overflow-hidden">
              <p className="text-xs font-bold tracking-widest text-(--color-brand) uppercase mb-3">Pantry tracking</p>
              <h2 className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) mb-4 leading-tight">
                Always know what you have
              </h2>
              <a
                href="https://larder-theta.vercel.app"
                className="inline-block bg-(--color-brand) text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-(--color-brand-dark) transition-colors mb-6 shadow-sm"
              >
                Get started free →
              </a>
              <div className="rounded-2xl overflow-hidden border border-(--color-border) shadow-sm">
                <MockPantryDashboard />
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={100} className="bg-stone-100 rounded-3xl p-8 overflow-hidden">
              <p className="text-xs font-bold tracking-widest text-stone-500 uppercase mb-3">Expiry alerts</p>
              <h2 className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) mb-4 leading-tight">
                Never let food expire again
              </h2>
              <a
                href="#features"
                className="inline-block border border-(--color-border) bg-white text-(--color-text-muted) px-5 py-2.5 rounded-xl font-semibold text-sm hover:text-(--color-text-primary) transition-colors mb-6"
              >
                See how it works ↓
              </a>
              <div className="rounded-2xl overflow-hidden border border-(--color-border) shadow-sm">
                <MockAlertsPage />
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* ── Stats bar ── */}
        <section className="py-8 px-6 border-y border-(--color-border) bg-(--color-card) mt-5">
          <CounterStats />
        </section>

        {/* ── Ticker strip ── */}
        <div className="overflow-hidden border-b border-(--color-border) bg-(--color-surface) py-4">
          <div className="ticker-track">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="px-10 text-sm text-(--color-text-muted) whitespace-nowrap">
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Tabbed features ── */}
        <section id="features" className="py-24 px-6 bg-(--color-surface)">
          <AnimatedSection className="text-center mb-14">
            <h2 className="font-[family-name:--font-display] text-4xl text-(--color-text-primary) mb-4">
              Everything your pantry needs
            </h2>
            <p className="text-(--color-text-muted) max-w-md mx-auto">
              From scanning receipts to tracking expiry dates — Larder handles it all automatically.
            </p>
          </AnimatedSection>
          <TabbedFeatures />
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
              <div className="hidden md:block absolute top-9 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-(--color-border)" />
              {steps.map((step, i) => (
                <AnimatedSection key={i} delay={i * 150} className="flex flex-col items-center text-center relative">
                  <div className="w-12 h-12 rounded-full bg-(--color-brand) text-white font-bold flex items-center justify-center mb-5 shrink-0 z-10 shadow-sm text-lg">
                    {i + 1}
                  </div>
                  <div className="text-4xl mb-4">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-(--color-text-primary) mb-2">{step.title}</h3>
                  <p className="text-sm text-(--color-text-muted) leading-relaxed">{step.body}</p>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* ── Social proof / testimonials ── */}
        <section className="py-24 px-6 bg-(--color-surface)">
          <div className="max-w-3xl mx-auto text-center">
            <AnimatedSection>
              <h2 className="font-[family-name:--font-display] text-4xl text-(--color-text-primary) mb-4">
                People are loving Larder
              </h2>
              <p className="text-(--color-text-muted) mb-14">Real households saving real money.</p>
            </AnimatedSection>
            <AnimatedSection delay={150}>
              <TestimonialRotator />
            </AnimatedSection>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 px-6 bg-(--color-card) border-y border-(--color-border)">
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
              <AnimatedSection delay={100} className="bg-(--color-card) rounded-2xl border-2 border-(--color-brand) shadow-[0_4px_24px_rgba(0,0,0,0.08)] p-8 flex flex-col relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="bg-(--color-brand) text-white text-xs font-bold px-3 py-1 rounded-full">MOST POPULAR</span>
                </div>
                <div className="font-[family-name:--font-display] text-3xl text-(--color-text-primary) mb-1 mt-2">Free</div>
                <div className="text-4xl font-bold text-(--color-text-primary) mb-6">
                  $0<span className="text-base font-normal text-(--color-text-muted)">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {freeFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-(--color-text-muted)">
                      <span className="w-5 h-5 rounded-full bg-(--color-brand-xlight) text-(--color-brand) text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a href="https://larder-theta.vercel.app" className="block text-center bg-(--color-brand) text-white py-3 rounded-xl font-semibold text-sm hover:bg-(--color-brand-dark) transition-colors">
                  Get started free →
                </a>
              </AnimatedSection>

              <AnimatedSection delay={200} className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8 flex flex-col opacity-60">
                <div className="inline-block bg-stone-100 text-stone-400 text-xs font-bold px-3 py-1 rounded-full mb-4 self-start tracking-wide">COMING SOON</div>
                <div className="font-[family-name:--font-display] text-3xl text-(--color-text-primary) mb-1">Pro</div>
                <div className="text-4xl font-bold text-(--color-text-primary) mb-6">
                  $5<span className="text-base font-normal text-(--color-text-muted)">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {proFeatures.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-(--color-text-muted)">
                      <span className="w-5 h-5 rounded-full bg-stone-100 text-stone-400 text-xs flex items-center justify-center shrink-0 mt-0.5 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button disabled className="block w-full text-center bg-stone-100 text-stone-400 py-3 rounded-xl font-semibold text-sm cursor-not-allowed">
                  Coming soon
                </button>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 px-6 bg-(--color-surface)">
          <div className="max-w-2xl mx-auto">
            <AnimatedSection className="text-center mb-14">
              <h2 className="font-[family-name:--font-display] text-4xl text-(--color-text-primary) mb-4">
                Frequently asked questions
              </h2>
              <p className="text-(--color-text-muted)">Everything you need to know about Larder.</p>
            </AnimatedSection>
            <AnimatedSection delay={100}>
              <FaqAccordion />
            </AnimatedSection>
          </div>
        </section>

        {/* ── Bottom CTA ── */}
        <section className="py-24 px-6 bg-(--color-brand-xlight) border-t border-(--color-border)">
          <div className="max-w-2xl mx-auto text-center">
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
                className="inline-block bg-(--color-brand) text-white px-10 py-4 rounded-xl font-semibold text-base hover:bg-(--color-brand-dark) transition-colors shadow-sm mb-10"
              >
                Start saving food — it&apos;s free →
              </a>

              <EmailSubscribe />
            </AnimatedSection>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
