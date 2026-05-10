import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy — Larder",
  description: "How Larder collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  return (
    <>
      <Nav />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-[family-name:--font-display] text-(--color-text-primary) tracking-tight mb-3">
          Privacy Policy
        </h1>
        <p className="text-sm text-(--color-text-faint) mb-12">Last updated: May 8, 2026</p>

        <div className="prose-content space-y-10 text-(--color-text-muted) leading-relaxed">

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">The short version</h2>
            <p>
              Larder helps you track the food in your kitchen. We only collect what we need to make
              that work: your email and the items you choose to add to your pantry. We don&apos;t sell
              your data, we don&apos;t run ads, and you can delete your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">What we collect</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-(--color-text-primary)">Account data</strong> — your email address and an encrypted password, so you can sign in.</li>
              <li><strong className="text-(--color-text-primary)">Pantry data</strong> — the items you add to your pantry (name, quantity, category, expiry date, optional price).</li>
              <li><strong className="text-(--color-text-primary)">Receipt uploads</strong> — when you upload a receipt photo or PDF, we send it to Anthropic&apos;s Claude AI to extract the items, then store the extracted text-based item list. The original image is not retained after processing.</li>
              <li><strong className="text-(--color-text-primary)">Server logs</strong> — basic request logs (IP address, timestamps, error codes) for security and debugging. These are kept for at most 30 days.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">How we store it</h2>
            <p>
              All data is stored in Supabase (PostgreSQL on AWS infrastructure, SOC 2 Type 2 compliant).
              Passwords are hashed with bcrypt — we never see them in plaintext. Sessions use JWT tokens
              with industry-standard ES256 signing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">Who we share it with</h2>
            <p className="mb-2">We share data with three vendors, only to operate the service:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong className="text-(--color-text-primary)">Supabase</strong> — database and auth provider.</li>
              <li><strong className="text-(--color-text-primary)">Anthropic</strong> — receipt images are sent to Claude AI for item extraction. Anthropic&apos;s data policy applies; they do not train models on API customer data.</li>
              <li><strong className="text-(--color-text-primary)">Render &amp; Vercel</strong> — backend and frontend hosting.</li>
            </ul>
            <p className="mt-3">
              We do not sell, rent, or share your data with advertisers, data brokers, or any other
              third parties.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">Your rights</h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>
                <strong className="text-(--color-text-primary)">Access</strong> — sign in and view your
                full pantry at any time.
              </li>
              <li>
                <strong className="text-(--color-text-primary)">Correction</strong> — edit any pantry
                item directly from the app.
              </li>
              <li>
                <strong className="text-(--color-text-primary)">Deletion</strong> — open the app
                sidebar and click <em>Delete account</em>. This removes your account, all pantry items,
                and all receipts immediately and irreversibly.
              </li>
              <li>
                <strong className="text-(--color-text-primary)">Export</strong> — email{" "}
                <a href="mailto:hello@larder.app" className="text-(--color-brand) hover:underline">hello@larder.app</a>
                {" "}and we&apos;ll send your data as JSON within 30 days.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">Cookies &amp; tracking</h2>
            <p>
              We use a single first-party cookie to keep you signed in. We don&apos;t use Google
              Analytics, Facebook Pixel, or any third-party trackers. There are no advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">Children</h2>
            <p>
              Larder is not directed at children under 13. We don&apos;t knowingly collect data from
              children under 13. If you believe a child has signed up, contact us and we&apos;ll delete
              the account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">Changes to this policy</h2>
            <p>
              If we make material changes, we&apos;ll update the &ldquo;Last updated&rdquo; date at the
              top and email registered users. Continuing to use the service after changes means you
              accept the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-(--color-text-primary) mb-3">Contact</h2>
            <p>
              Questions about this policy or your data? Email{" "}
              <a href="mailto:hello@larder.app" className="text-(--color-brand) hover:underline">
                hello@larder.app
              </a>.
            </p>
          </section>

        </div>
      </main>
      <Footer />
    </>
  );
}
