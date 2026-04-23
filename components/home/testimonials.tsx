const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Beauty seller",
    country: "United States",
    avatar: "SK",
    text: "FastFulfill helped me find suppliers faster. They checked the products before shipping, so fewer bad items reached my customers.",
    stars: 5,
    metric: "Supplier search",
    detail: "Beauty, US market",
  },
  {
    name: "James M.",
    role: "Home goods seller",
    country: "United Kingdom",
    avatar: "JM",
    text: "The prices were easier to understand than doing everything myself. My UK orders arrived faster than before.",
    stars: 5,
    metric: "9-day UK delivery",
    detail: "Home goods, UK market",
  },
  {
    name: "Amir T.",
    role: "Pet products seller",
    country: "Germany",
    avatar: "AT",
    text: "The dashboard makes it easy to see all my orders in one place. Tracking is clear and my customers like the faster delivery.",
    stars: 5,
    metric: "Clear tracking",
    detail: "Pet products, Germany",
  },
  {
    name: "Lena P.",
    role: "Fitness store owner",
    country: "Australia",
    avatar: "LP",
    text: "The team answers quickly and explains things in simple words. I do not need to chase suppliers every day.",
    stars: 5,
    metric: "Fast replies",
    detail: "Fitness, Australia",
  },
  {
    name: "Carlos R.",
    role: "General store seller",
    country: "Canada",
    avatar: "CR",
    text: "They helped with packaging and labels. My products look more professional without me managing the factory myself.",
    stars: 5,
    metric: "Custom packaging",
    detail: "General store, Canada",
  },
  {
    name: "Nadia B.",
    role: "Gadget store owner",
    country: "France",
    avatar: "NB",
    text: "I get product prices quickly, shipping is clear, and I know what is happening with every order.",
    stars: 5,
    metric: "Simple order view",
    detail: "Gadgets, France",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white dark:bg-gray-950">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Results</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            Sellers using FastFulfill
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Simple stories from sellers who wanted easier product sourcing and shipping.
          </p>
        </div>

        <div className="mb-8 rounded-[28px] border border-gray-200 bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900 p-6 text-white shadow-xl shadow-slate-900/10 dark:border-gray-800 md:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-brand-300">
                Featured store outcome
              </p>
              <h3 className="mt-3 text-2xl font-extrabold md:text-3xl">
                A UK beauty seller used FastFulfill to simplify sourcing, packaging, and delivery
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
                Product pricing was easier to compare, sample checks reduced uncertainty, and customer orders started moving with clearer delivery expectations instead of supplier guesswork.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                { label: "Market", value: "United Kingdom" },
                { label: "Observed result", value: "9-day delivery" },
                { label: "Why it mattered", value: "Clearer tracking" },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    {item.label}
                  </p>
                  <p className="mt-2 text-lg font-bold text-white">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-gray-50 hover:bg-white dark:bg-gray-900 dark:hover:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 hover:border-gray-200 dark:hover:border-gray-700 hover:shadow-md transition-all">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role}, {t.country}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500">{t.detail}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/30 border border-brand-100 dark:border-brand-800 px-2.5 py-1 rounded-full shrink-0">
                  {t.metric}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
