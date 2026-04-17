const STEPS = [
  {
    number: "01",
    title: "Submit a Sourcing Request",
    description: "Share the product URL or describe what you need. Our agents find and evaluate suppliers within 24h.",
  },
  {
    number: "02",
    title: "Review Quotes & Samples",
    description: "We negotiate the best price and arrange sample shipments so you can verify quality before committing.",
  },
  {
    number: "03",
    title: "Place Your Order",
    description: "Confirm your order with a single click. We handle everything with the supplier with no Alibaba headaches.",
  },
  {
    number: "04",
    title: "We Inspect & Pack",
    description: "Every shipment goes through quality control in our Shenzhen warehouse before it leaves China.",
  },
  {
    number: "05",
    title: "Ship to Your Customers",
    description: "Direct to your warehouse or direct to your customers. Full tracking on every package.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-24 bg-white" id="how-it-works">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            The Process
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            How FastFulfill Works
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            From idea to your customer&apos;s door in 5 simple steps.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-8 left-[calc(10%+2rem)] right-[calc(10%+2rem)] h-px bg-gradient-to-r from-brand-200 via-brand-400 to-brand-200" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="relative mb-5">
                  <div className="w-16 h-16 rounded-2xl bg-brand-50 border-2 border-brand-100 flex items-center justify-center group-hover:border-brand-400 group-hover:bg-brand-100 transition-all z-10 relative">
                    <span className="text-xl font-black text-brand-600">{step.number}</span>
                  </div>
                </div>
                <h3 className="text-sm font-bold text-gray-900 mb-1.5">{step.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
