import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "FastFulfill terms for product sourcing, warehousing, fulfillment, payments, and platform access.",
};

export default function TermsPage() {
  return (
    <main className="bg-white dark:bg-gray-950">
      <section className="container-section max-w-3xl py-16">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">Legal</p>
        <h1 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white">Terms of Service</h1>
        <p className="mt-4 text-sm leading-6 text-gray-500 dark:text-gray-400">
          These terms describe the basic rules for using FastFulfill. Final commercial terms for each sourcing, warehousing, or fulfillment order are confirmed in writing inside your quote or invoice.
        </p>

        <div className="mt-10 space-y-8 text-sm leading-7 text-gray-600 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">1. Services</h2>
            <p className="mt-2">
              FastFulfill helps customers request product sourcing, compare suppliers, arrange samples, store inventory, and fulfill orders from China. Availability depends on product type, destination country, carrier coverage, and compliance checks.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">2. Quotes and Payments</h2>
            <p className="mt-2">
              Quotes can include product cost, domestic handling, international shipping, storage, packaging, and service fees. Prices may change if supplier pricing, freight rates, customs requirements, or order quantities change before payment.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">3. Product Responsibility</h2>
            <p className="mt-2">
              Customers are responsible for making sure products can legally be sold in their destination markets. FastFulfill may reject restricted, unsafe, counterfeit, or non-compliant products.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">4. Shipping and Delivery</h2>
            <p className="mt-2">
              Delivery estimates are not guarantees. Carriers, customs, holidays, weather, address issues, and destination rules can affect transit time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">5. Account Access</h2>
            <p className="mt-2">
              You are responsible for keeping your account secure and for all activity under your account. FastFulfill may suspend access if the platform is misused or if payment obligations are not met.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">6. Contact</h2>
            <p className="mt-2">
              Questions about these terms can be sent through the contact page.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}
