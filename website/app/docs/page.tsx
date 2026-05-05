import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const sections = [
  { id: "quick-start", title: "Quick start" },
  { id: "scanning", title: "Scanning a receipt" },
  { id: "pantry", title: "Pantry management" },
  { id: "alerts", title: "Expiry alerts" },
  { id: "faq", title: "FAQ" },
];

const faqs = [
  {
    q: "How much does Larder cost?",
    a: "Larder is completely free to use. No credit card required. A paid Pro tier with household sharing and email sync is coming soon.",
  },
  {
    q: "Is my data private?",
    a: "Yes. Your pantry is protected by JWT authentication — only your account can access your items. We use Supabase (SOC 2 compliant infrastructure) to store your data securely.",
  },
  {
    q: "What receipt formats are supported?",
    a: "JPEG, PNG, WebP, and GIF photo files work — including photos taken at an angle. PDFs work too, including digital receipts downloaded from your inbox or email.",
  },
  {
    q: "How does Larder estimate expiry dates?",
    a: "Claude AI estimates shelf life based on the item type and typical storage conditions. Milk gets 7 days, potatoes get 30 days, canned goods much longer. You can always edit an item's expiry date if the estimate is off.",
  },
  {
    q: "Can I fix items the AI got wrong?",
    a: "Yes. Hover over any pantry item and click the ✏️ button to edit the name, quantity, unit, category, or expiry date. Changes save instantly.",
  },
  {
    q: "What happens when something expires?",
    a: "Expired items stay in your pantry with a red 'Expired' badge — they don't disappear automatically. Only you can remove them by clicking Used or the delete (🗑) button.",
  },
  {
    q: "Can multiple people share one pantry?",
    a: "Household sharing is coming in the Pro tier. Right now each account has its own completely separate pantry.",
  },
  {
    q: "Is there a mobile app?",
    a: "A React Native mobile app for iPhone and Android is on the roadmap. For now, the web app at larder-theta.vercel.app is fully responsive and works great on any mobile browser.",
  },
];

export default function DocsPage() {
  return (
    <>
      <Nav />
      <div className="max-w-5xl mx-auto px-4 py-12 flex gap-12">
        {/* Sidebar */}
        <aside className="hidden md:block w-48 shrink-0">
          <div className="sticky top-20">
            <p className="text-xs font-semibold text-(--color-text-faint) uppercase tracking-wider mb-4">
              On this page
            </p>
            <nav className="flex flex-col gap-1">
              {sections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="text-sm text-(--color-text-muted) hover:text-(--color-brand) hover:bg-(--color-brand-xlight) px-3 py-1.5 rounded-lg transition-colors"
                >
                  {s.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          <h1 className="font-[family-name:--font-display] text-4xl text-(--color-text-primary) mb-2">
            Documentation
          </h1>
          <p className="text-(--color-text-muted) mb-12">
            Everything you need to get started with Larder.
          </p>

          {/* Quick start */}
          <section id="quick-start" className="mb-14 scroll-mt-20">
            <h2 className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) mb-4">
              Quick start
            </h2>
            <div className="space-y-4">
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-(--color-brand) text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-semibold text-(--color-text-primary) text-sm mb-1">
                    Open the app
                  </p>
                  <p className="text-sm text-(--color-text-muted) leading-relaxed">
                    Go to{" "}
                    <a
                      href="https://larder-theta.vercel.app"
                      className="text-(--color-brand) underline underline-offset-2"
                    >
                      larder-theta.vercel.app
                    </a>{" "}
                    in any browser, including your phone.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-(--color-brand) text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-semibold text-(--color-text-primary) text-sm mb-1">
                    Create a free account
                  </p>
                  <p className="text-sm text-(--color-text-muted) leading-relaxed">
                    Click Sign up, enter your email and a password. No credit card needed.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-7 h-7 rounded-full bg-(--color-brand) text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-semibold text-(--color-text-primary) text-sm mb-1">
                    Scan your first receipt
                  </p>
                  <p className="text-sm text-(--color-text-muted) leading-relaxed">
                    Click the 📸 camera button, upload a photo of a grocery receipt, and watch your
                    pantry fill up automatically.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Scanning */}
          <section id="scanning" className="mb-14 scroll-mt-20">
            <h2 className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) mb-4">
              Scanning a receipt
            </h2>
            <p className="text-sm text-(--color-text-muted) leading-relaxed mb-4">
              Larder uses Claude AI to read your receipt and extract each item, its estimated
              quantity, and its expected shelf life.
            </p>
            <h3 className="font-semibold text-(--color-text-primary) text-sm mb-3">
              Supported formats
            </h3>
            <div className="bg-(--color-card) rounded-2xl border border-(--color-border) overflow-hidden mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-(--color-border) bg-(--color-surface)">
                    <th className="text-left px-4 py-2.5 text-(--color-text-muted) font-medium">
                      Format
                    </th>
                    <th className="text-left px-4 py-2.5 text-(--color-text-muted) font-medium">
                      Supported?
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-(--color-border)">
                  {[
                    ["JPEG / JPG photo", "✅ Yes"],
                    ["PNG screenshot", "✅ Yes"],
                    ["WebP (from web)", "✅ Yes"],
                    ["GIF", "✅ Yes"],
                    ["PDF (digital receipt)", "✅ Yes"],
                    ["Excel (.xlsx)", "✅ Yes"],
                    ["Word (.docx)", "✅ Yes"],
                    ["CSV / TXT", "✅ Yes"],
                  ].map(([fmt, status]) => (
                    <tr key={fmt}>
                      <td className="px-4 py-2.5 text-(--color-text-primary)">{fmt}</td>
                      <td className="px-4 py-2.5 text-(--color-text-muted)">{status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <h3 className="font-semibold text-(--color-text-primary) text-sm mb-2">
              Tips for best results
            </h3>
            <ul className="space-y-1.5 text-sm text-(--color-text-muted)">
              <li className="flex gap-2">
                <span className="shrink-0">•</span>Lay the receipt flat and shoot straight down
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">•</span>Good lighting helps — avoid heavy shadows
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">•</span>The full receipt doesn&apos;t need to be in frame
                — item lines are what matter
              </li>
              <li className="flex gap-2">
                <span className="shrink-0">•</span>Uploads are capped at 10 MB
              </li>
            </ul>
          </section>

          {/* Pantry management */}
          <section id="pantry" className="mb-14 scroll-mt-20">
            <h2 className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) mb-4">
              Pantry management
            </h2>
            <div className="space-y-5 text-sm text-(--color-text-muted) leading-relaxed">
              <div>
                <p className="font-semibold text-(--color-text-primary) mb-1">Edit an item</p>
                <p>
                  Hover over any item row and click the ✏️ button. A modal opens with the item
                  pre-filled — change the name, quantity, unit, category, or expiry date and click
                  Save.
                </p>
              </div>
              <div>
                <p className="font-semibold text-(--color-text-primary) mb-1">Delete an item</p>
                <p>
                  Hover over any item row and click the 🗑 button. The item is soft-deleted —
                  removed from your pantry view, but the history is kept for your records.
                </p>
              </div>
              <div>
                <p className="font-semibold text-(--color-text-primary) mb-1">Use one unit</p>
                <p>
                  Click the <strong className="text-(--color-text-primary)">[ − ]</strong> button on the
                  left of an item row to use one unit. &quot;3 pints&quot; becomes &quot;2 pints.&quot; When the last
                  unit is used, the item is marked as consumed and removed from the pantry.
                </p>
              </div>
              <div>
                <p className="font-semibold text-(--color-text-primary) mb-1">
                  Mark as used (all at once)
                </p>
                <p>
                  The <strong className="text-(--color-text-primary)">Used</strong> button removes the
                  entire item at once. Perfect when you finish a whole container.
                </p>
              </div>
              <div>
                <p className="font-semibold text-(--color-text-primary) mb-1">Filter by category</p>
                <p>
                  Click any category pill at the top of the pantry (Produce, Dairy, Meat, etc.) to
                  filter the list. Click again to clear.
                </p>
              </div>
            </div>
          </section>

          {/* Expiry alerts */}
          <section id="alerts" className="mb-14 scroll-mt-20">
            <h2 className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) mb-4">
              Expiry alerts
            </h2>
            <div className="space-y-4 text-sm text-(--color-text-muted) leading-relaxed">
              <p>
                Larder automatically flags items as they age. The freshness bar under each item
                changes color over time:
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 rounded-full bg-emerald-400 shrink-0"></div>
                  <span>
                    <strong className="text-(--color-text-primary)">Green</strong> — plenty of time
                    left (6+ days)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 rounded-full bg-amber-400 shrink-0"></div>
                  <span>
                    <strong className="text-(--color-text-primary)">Amber</strong> — use soon (3–5
                    days)
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 rounded-full bg-red-400 shrink-0"></div>
                  <span>
                    <strong className="text-(--color-text-primary)">Red</strong> — expiring today or
                    tomorrow, or already expired
                  </span>
                </div>
              </div>
              <p>
                A red alert strip appears at the top of your pantry when any item is within 3 days
                of expiry or already expired. It lists the item names so you can act fast.
              </p>
              <p>
                A nightly job runs at 2am EST to update expired item statuses. Expired items stay
                visible in your pantry with a red &quot;Expired&quot; badge — they only disappear when
                you remove them manually.
              </p>
            </div>
          </section>

          {/* FAQ */}
          <section id="faq" className="mb-14 scroll-mt-20">
            <h2 className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) mb-6">
              FAQ
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details
                  key={i}
                  className="bg-(--color-card) rounded-2xl border border-(--color-border) group"
                >
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer list-none font-semibold text-sm text-(--color-text-primary) hover:bg-(--color-surface) rounded-2xl transition-colors">
                    {faq.q}
                    <span className="text-(--color-text-faint) text-lg leading-none group-open:rotate-45 transition-transform shrink-0 ml-4">
                      +
                    </span>
                  </summary>
                  <div className="px-5 pb-4 pt-1 text-sm text-(--color-text-muted) leading-relaxed border-t border-(--color-border)">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </section>

          {/* CTA */}
          <div className="bg-(--color-brand-xlight) rounded-2xl border border-(--color-border) p-8 text-center">
            <p className="font-[family-name:--font-display] text-2xl text-(--color-text-primary) mb-2">
              Ready to stop wasting food?
            </p>
            <p className="text-sm text-(--color-text-muted) mb-5">
              It takes less than a minute to set up.
            </p>
            <a
              href="https://larder-theta.vercel.app"
              className="inline-block bg-(--color-brand) text-white px-6 py-3 rounded-xl font-semibold text-sm hover:bg-(--color-brand-light) transition-colors shadow-sm"
            >
              Get started free →
            </a>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
