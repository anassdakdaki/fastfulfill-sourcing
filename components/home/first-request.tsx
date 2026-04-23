import { ClipboardCheck, PackageCheck, SearchCheck, Truck, WalletCards } from "lucide-react";

const STEPS = [
  {
    title: "Send the product",
    text: "Paste a product link, photo, or short description. Add target country, quantity, and packaging notes.",
    icon: SearchCheck,
  },
  {
    title: "We check factories",
    text: "Our team compares suppliers, confirms MOQ, checks sample options, and gives you a clear landed price.",
    icon: ClipboardCheck,
  },
  {
    title: "You approve the quote",
    text: "After you accept, we order stock, inspect units, pack them, and prepare the shipment flow.",
    icon: PackageCheck,
  },
];

const PROOF = [
  { title: "QC check", text: "Photos, defect notes, and sample feedback before customer shipping." },
  { title: "Warehouse storage", text: "Inventory held in Shenzhen with stock counts visible in your dashboard." },
  { title: "Packaging", text: "Plain mailers, inserts, labels, and branded packaging when your order is ready." },
  { title: "Tracking", text: "Tracking number syncs back to FastFulfill and your connected store." },
];

const COSTS = [
  { label: "Product cost", value: "Factory unit price for the confirmed product and quantity." },
  { label: "Shipping cost", value: "Carrier, destination, weight, size, and service speed." },
  { label: "Service fee", value: "Sourcing, QC, storage handling, packing, and order support." },
];

export function FirstRequest() {
  return (
    <section className="bg-white py-20 dark:bg-gray-950">
      <div className="container-section min-w-0">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-brand-600 dark:text-brand-400">
            First request
          </p>
          <h2 className="mt-3 text-3xl font-extrabold text-gray-900 dark:text-white md:text-4xl">
            How your first product request works
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            You do not need supplier contacts, freight accounts, or warehouse staff. Send the product and we handle the sourcing path.
          </p>
        </div>

        <div className="mt-12 grid min-w-0 gap-4 md:grid-cols-3">
          {STEPS.map((step, index) => (
            <div key={step.title} className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                <step.icon size={20} />
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                Step {index + 1}
              </p>
              <h3 className="mt-2 text-lg font-bold text-gray-950 dark:text-white">{step.title}</h3>
              <p className="mt-3 break-words text-sm leading-6 text-gray-700 dark:text-gray-400">{step.text}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-gray-950 dark:text-white">Proof you should expect</h3>
            </div>
            <div className="mt-5 grid min-w-0 gap-3 sm:grid-cols-2">
              {PROOF.map((item) => (
                <div key={item.title} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-sm font-semibold text-gray-950 dark:text-white">{item.title}</p>
                  <p className="mt-1 break-words text-xs leading-5 text-gray-700 dark:text-gray-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
                <WalletCards size={18} />
              </div>
              <h3 className="font-bold text-gray-950 dark:text-white">What you pay for</h3>
            </div>
            <div className="mt-5 space-y-3">
              {COSTS.map((item) => (
                <div key={item.label} className="min-w-0 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <p className="text-sm font-semibold text-gray-950 dark:text-white">{item.label}</p>
                  <p className="mt-1 break-words text-xs leading-5 text-gray-700 dark:text-gray-400">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
