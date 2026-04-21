const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Beauty store owner",
    country: "United States",
    avatar: "SK",
    text: "FastFulfill helped me find suppliers faster. They checked the products before shipping, so fewer bad items reached my customers.",
    stars: 5,
    metric: "Faster supplier search",
  },
  {
    name: "James M.",
    role: "Online seller",
    country: "United Kingdom",
    avatar: "JM",
    text: "The prices were easier to understand than doing everything myself. My UK orders arrived faster than before.",
    stars: 5,
    metric: "9-day UK shipping",
  },
  {
    name: "Amir T.",
    role: "Pet products seller",
    country: "Germany",
    avatar: "AT",
    text: "The dashboard makes it easy to see all my orders in one place. Tracking is clear and my customers like the faster delivery.",
    stars: 5,
    metric: "Clear tracking",
  },
  {
    name: "Lena P.",
    role: "Fitness store owner",
    country: "Australia",
    avatar: "LP",
    text: "The team answers quickly and explains things in simple words. I do not need to chase suppliers every day.",
    stars: 5,
    metric: "Fast replies",
  },
  {
    name: "Carlos R.",
    role: "General store seller",
    country: "Canada",
    avatar: "CR",
    text: "They helped with packaging and labels. My products look more professional without me managing the factory myself.",
    stars: 5,
    metric: "Custom packaging",
  },
  {
    name: "Nadia B.",
    role: "Gadget store owner",
    country: "France",
    avatar: "NB",
    text: "I get product prices quickly, shipping is clear, and I know what is happening with every order.",
    stars: 5,
    metric: "Simple order view",
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
                    <p className="text-xs text-gray-500 dark:text-gray-400">{t.role} - {t.country}</p>
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
