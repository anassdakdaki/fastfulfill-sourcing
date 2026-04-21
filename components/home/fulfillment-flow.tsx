const FLOW = [
  {
    step: "1",
    icon: "🛍️",
    title: "Shopify order placed",
    desc: "Customer buys on your store",
    color: "bg-green-50 border-green-200",
    textColor: "text-green-700",
    badge: "Shopify webhook",
  },
  {
    step: "2",
    icon: "📥",
    title: "FastFulfill receives it",
    desc: "Auto-synced to your dashboard in seconds",
    color: "bg-brand-50 border-brand-200",
    textColor: "text-brand-700",
    badge: "Real-time sync",
  },
  {
    step: "3",
    icon: "🔍",
    title: "Warehouse picks & inspects",
    desc: "Item pulled from stock, QC checked",
    color: "bg-purple-50 border-purple-200",
    textColor: "text-purple-700",
    badge: "QC every order",
  },
  {
    step: "4",
    icon: "📦",
    title: "Packed in your branding",
    desc: "Custom box, inserts, your label",
    color: "bg-orange-50 border-orange-200",
    textColor: "text-orange-700",
    badge: "White-label",
  },
  {
    step: "5",
    icon: "✈️",
    title: "Ships to your customer",
    desc: "Direct DDP — no customs surprise",
    color: "bg-blue-50 border-blue-200",
    textColor: "text-blue-700",
    badge: "7–12 days",
  },
  {
    step: "6",
    icon: "📍",
    title: "Tracking syncs back",
    desc: "Customer gets tracking number automatically",
    color: "bg-gray-50 border-gray-200",
    textColor: "text-gray-700",
    badge: "Auto-notified",
  },
];

export function FulfillmentFlow() {
  return (
    <section className="py-24 bg-white" id="fulfillment">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            How Orders Flow
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            From Shopify sale to customer door
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Everything is automated. You don&apos;t touch a single package — the system handles it end to end.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {FLOW.map((item, i) => (
            <div key={i} className="relative">
              {/* Connector */}
              {i < FLOW.length - 1 && (
                <div className="hidden lg:block absolute top-7 right-0 w-3 h-px bg-gray-200 translate-x-1.5 z-10" />
              )}

              <div className={`border rounded-2xl p-4 text-center h-full flex flex-col items-center gap-2 ${item.color}`}>
                <div className="text-2xl">{item.icon}</div>
                <p className="text-xs font-bold text-gray-900 leading-tight">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
                <span className={`mt-auto text-xs font-semibold px-2 py-0.5 rounded-full bg-white/70 ${item.textColor}`}>
                  {item.badge}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom callout */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: "⚡", title: "Zero manual work", desc: "No CSV exports, no copy-pasting orders, no back-and-forth with suppliers" },
            { icon: "🔒", title: "Defects caught before shipping", desc: "Physical inspection means unhappy customers stay off your reviews" },
            { icon: "📊", title: "Full visibility at all times", desc: "Every order's status is visible in your dashboard, from sourcing to delivery" },
          ].map((item) => (
            <div key={item.title} className="flex gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-5">
              <span className="text-2xl shrink-0">{item.icon}</span>
              <div>
                <p className="text-sm font-bold text-gray-900 mb-1">{item.title}</p>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
