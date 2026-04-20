import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy – FastFulfill",
  description: "How FastFulfill collects, uses, and protects your data.",
};

export default function PrivacyPage() {
  const updated = "April 20, 2026";
  const email   = "privacy@fastfulfill.com";
  const appUrl  = "https://fastfullfillsourcing.vercel.app";

  return (
    <div className="max-w-3xl mx-auto px-6 py-16 text-slate-700">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Privacy Policy</h1>
      <p className="text-sm text-slate-500 mb-10">Last updated: {updated}</p>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">1. Overview</h2>
        <p>
          FastFulfill (&ldquo;we&rdquo;, &ldquo;us&rdquo;) operates the sourcing and fulfillment
          platform at <a href={appUrl} className="text-indigo-600 underline">{appUrl}</a>.
          This policy explains what data we collect, how we use it, and your rights.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">2. Data We Collect</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Account data:</strong> email address, name, business name, role (buyer / supplier / warehouse).</li>
          <li><strong>Order data:</strong> product names, quantities, shipping addresses, tracking numbers imported from connected stores.</li>
          <li><strong>Shopify store data:</strong> store domain, OAuth access tokens (encrypted at rest), order webhooks.</li>
          <li><strong>Payment data:</strong> invoices and Stripe checkout sessions. Card details are processed by Stripe — we never see raw card numbers.</li>
          <li><strong>Usage data:</strong> page views and server logs retained for up to 30 days.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">3. How We Use Your Data</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>To provide sourcing quotes, order management, and fulfillment services.</li>
          <li>To sync orders from your connected Shopify store in real time.</li>
          <li>To send transactional emails (quote notifications, shipment updates, invoices).</li>
          <li>To process payments via Stripe.</li>
          <li>To improve platform reliability and debug errors.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">4. Shopify Data</h2>
        <p className="mb-2">
          When you connect a Shopify store, we request the <strong>read_orders</strong> scope to
          import orders into FastFulfill. We do not access products, customers, or any other
          store data beyond orders.
        </p>
        <p>
          We comply with Shopify&rsquo;s GDPR requirements. Upon receiving a
          <code className="bg-slate-100 px-1 rounded text-sm">customers/redact</code> or{" "}
          <code className="bg-slate-100 px-1 rounded text-sm">shop/redact</code> webhook, we
          anonymize or delete the relevant records from our database within 30 days.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">5. Data Sharing</h2>
        <p>We do not sell your data. We share data only with:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li><strong>Supabase</strong> — database and authentication hosting.</li>
          <li><strong>Stripe</strong> — payment processing.</li>
          <li><strong>Resend</strong> — transactional email delivery.</li>
          <li><strong>Vercel</strong> — application hosting and serverless functions.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">6. Data Retention</h2>
        <p>
          We retain your account and order data for as long as your account is active.
          If you close your account, we delete your personal data within 30 days,
          except where retention is required by law (e.g. financial records).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">7. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc pl-6 space-y-2 mt-2">
          <li>Access the personal data we hold about you.</li>
          <li>Request correction of inaccurate data.</li>
          <li>Request deletion of your data (right to erasure).</li>
          <li>Export your data in a portable format.</li>
          <li>Withdraw consent at any time by disconnecting your Shopify store or closing your account.</li>
        </ul>
        <p className="mt-3">
          To exercise these rights, email us at{" "}
          <a href={`mailto:${email}`} className="text-indigo-600 underline">{email}</a>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">8. Cookies</h2>
        <p>
          We use only essential session cookies required for authentication and security
          (OAuth state tokens, Supabase session). We do not use tracking or advertising cookies.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">9. Security</h2>
        <p>
          All data is transmitted over HTTPS. Shopify access tokens are stored encrypted.
          Passwords are handled by Supabase Auth (bcrypt-hashed). We conduct regular
          security reviews of our infrastructure.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold text-slate-800 mb-3">10. Changes to This Policy</h2>
        <p>
          We may update this policy periodically. We&rsquo;ll notify you by email or
          an in-app notice for material changes. Continued use of FastFulfill after
          changes constitutes acceptance.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-semibold text-slate-800 mb-3">11. Contact</h2>
        <p>
          Questions? Email us at{" "}
          <a href={`mailto:${email}`} className="text-indigo-600 underline">{email}</a>.
        </p>
      </section>
    </div>
  );
}
