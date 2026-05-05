import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

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
    body: "Get alerts before you leave home. Never buy duplicates. Never find forgotten food at the back of the fridge.",
  },
];

const features = [
  {
    icon: "🤖",
    title: "AI receipt reading",
    body: "Reads JPEG, PNG, WebP, PDF, and more — even photos taken at an angle. Claude AI handles the hard part.",
  },
  {
    icon: "🌈",
    title: "Visual freshness bars",
    body: "Color-coded from green to amber to red as items age. Know what to use first at a glance.",
  },
  {
    icon: "⏰",
    title: "Expiry alerts",
    body: "A red strip at the top of your pantry shows exactly what's about to go bad, with the date.",
  },
  {
    icon: "✏️",
    title: "Full item control",
    body: "Edit names, quantities, units. Tap − to use one at a time, or mark the whole thing used at once.",
  },
  {
    icon: "🔒",
    title: "Private by default",
    body: "JWT authentication means your pantry is completely yours. No other user can ever see your data.",
  },
  {
    icon: "💸",
    title: "Free to start",
    body: "No credit card. No trial period. Sign up and start scanning receipts in under a minute.",
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

export default function Home() {
  return (
    <>
      <Nav />
      <main>
        {/* ── Hero ── */}
        <section className="py-28 md:py-36 px-4 text-center bg-(--color-surface)">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-[family-name:--font-display] text-5xl md:text-7xl leading-[1.1] text-(--color-text-primary) mb-6">
              Stop wasting groceries.
              <br />
              Start knowing your pantry.
            </h1>
            <p className="text-lg md:text-xl text-(--color-text-muted) max-w-xl mx-auto mb-10 leading-relaxed">
              Snap your receipt. Larder reads it, tracks your food, and warns you before you overbuy.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://larder-theta.vercel.app"
                className="bg-(--color-brand) text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-(--color-brand-light) transition-colors shadow-sm"
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
            <div className="mt-16 flex justify-center gap-4 md:gap-6 text-5xl md:text-6xl opacity-40 select-none">
              <span>🥦</span>
              <span>🍅</span>
              <span>🥛</span>
              <span>🧅</span>
              <span>🫐</span>
              <span>🥚</span>
            </div>
          </div>
        </section>

        {/* ── How it works ── */}
        <section id="how-it-works" className="py-24 px-4 bg-(--color-card-warm)">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-[family-name:--font-display] text-4xl text-center text-(--color-text-primary) mb-16">
              How it works
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              {steps.map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-(--color-brand) text-white text-sm font-bold flex items-center justify-center mb-5 shrink-0">
                    {i + 1}
                  </div>
                  <div className="text-5xl mb-4">{step.icon}</div>
                  <h3 className="text-lg font-semibold text-(--color-text-primary) mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-(--color-text-muted) leading-relaxed">{step.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features ── */}
        <section id="features" className="py-24 px-4 bg-(--color-card)">
          <div className="max-w-5xl mx-auto">
            <h2 className="font-[family-name:--font-display] text-4xl text-center text-(--color-text-primary) mb-4">
              Everything you need. Nothing you don&apos;t.
            </h2>
            <p className="text-center text-(--color-text-muted) mb-14 text-base">
              Built for people who actually cook, not for enterprise pantry managers.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div
                  key={i}
                  className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-6"
                >
                  <div className="text-3xl mb-3">{f.icon}</div>
                  <h3 className="font-semibold text-(--color-text-primary) mb-2">{f.title}</h3>
                  <p className="text-sm text-(--color-text-muted) leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="py-24 px-4 bg-(--color-surface)">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-[family-name:--font-display] text-4xl text-center text-(--color-text-primary) mb-4">
              Simple, honest pricing
            </h2>
            <p className="text-center text-(--color-text-muted) mb-14 text-base">
              Start free. Upgrade when your household grows.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Free */}
              <div className="bg-(--color-card) rounded-2xl border-2 border-(--color-brand) shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-8 flex flex-col">
                <div className="inline-block bg-(--color-brand-xlight) text-(--color-brand) text-xs font-bold px-3 py-1 rounded-full mb-4 self-start tracking-wide">
                  FREE NOW
                </div>
                <div className="font-[family-name:--font-display] text-3xl text-(--color-text-primary) mb-1">
                  Free
                </div>
                <div className="text-4xl font-bold text-(--color-text-primary) mb-6">
                  $0
                  <span className="text-base font-normal text-(--color-text-muted)">/month</span>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {freeFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-(--color-text-muted)">
                      <span className="text-green-500 mt-0.5 shrink-0 font-bold">✓</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <a
                  href="https://larder-theta.vercel.app"
                  className="block text-center bg-(--color-brand) text-white py-3 rounded-xl font-semibold text-sm hover:bg-(--color-brand-light) transition-colors"
                >
                  Get started free →
                </a>
              </div>

              {/* Pro */}
              <div className="bg-(--color-card) rounded-2xl border border-(--color-border) shadow-[0_1px_4px_rgba(0,0,0,0.06)] p-8 flex flex-col opacity-60">
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
                  {proFeatures.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-(--color-text-muted)">
                      <span className="text-stone-300 mt-0.5 shrink-0 font-bold">✓</span>
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
              </div>
            </div>
          </div>
        </section>

        {/* ── Social proof / Why it matters ── */}
        <section id="why" className="py-24 px-4 bg-(--color-brand-xlight)">
          <div className="max-w-3xl mx-auto text-center">
            <p className="font-[family-name:--font-display] text-4xl md:text-5xl text-(--color-text-primary) mb-6 leading-snug">
              The average US household wastes{" "}
              <span className="text-(--color-brand)">$1,500 of food</span> every year.
            </p>
            <p className="text-(--color-text-muted) text-lg mb-12 max-w-lg mx-auto">
              Larder helps you see what you have before you shop, so nothing goes to waste.
            </p>

            <div className="grid md:grid-cols-2 gap-6 text-left mb-12">
              <div className="bg-(--color-card) rounded-2xl border border-(--color-border) p-6 shadow-sm">
                <p className="text-(--color-text-muted) text-sm leading-relaxed mb-4">
                  &ldquo;I used to throw away vegetables every week. Now I actually check Larder before I
                  shop. Game changer.&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-(--color-brand-xlight) border border-(--color-border) flex items-center justify-center text-sm">
                    👩
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-(--color-text-primary)">Sarah K.</div>
                    <div className="text-xs text-(--color-text-faint)">Home cook, Chicago</div>
                  </div>
                </div>
              </div>
              <div className="bg-(--color-card) rounded-2xl border border-(--color-border) p-6 shadow-sm">
                <p className="text-(--color-text-muted) text-sm leading-relaxed mb-4">
                  &ldquo;Bought blueberries three weeks in a row before I started using this. Not
                  anymore.&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-(--color-brand-xlight) border border-(--color-border) flex items-center justify-center text-sm">
                    👨
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-(--color-text-primary)">Marcus T.</div>
                    <div className="text-xs text-(--color-text-faint)">Busy parent, Austin</div>
                  </div>
                </div>
              </div>
            </div>

            <a
              href="https://larder-theta.vercel.app"
              className="inline-block bg-(--color-brand) text-white px-8 py-3.5 rounded-xl font-semibold text-base hover:bg-(--color-brand-light) transition-colors shadow-sm"
            >
              Start saving food — it&apos;s free →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
