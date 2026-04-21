const TESTIMONIALS = [
  {
    name: "Sarah K.",
    role: "Beauty Brand Owner",
    country: "🇺🇸 United States",
    avatar: "SK",
    text: "FastFulfill cut my sourcing time from weeks to 48 hours. My agent found suppliers I never could have found on Alibaba, and the QC caught a bad batch before it reached my customers.",
    stars: 5,
    metric: "3× faster sourcing",
  },
  {
    name: "James M.",
    role: "Shopify Dropshipper",
    country: "🇬🇧 United Kingdom",
    avatar: "JM",
    text: "I was skeptical at first, but the pricing is genuinely cheaper than sourcing myself. 9-day shipping to UK and I'm doing 4× my old revenue with the same product.",
    stars: 5,
    metric: "4× revenue growth",
  },
  {
    name: "Amir T.",
    role: "Pet Supplies Store",
    country: "🇩🇪 Germany",
    avatar: "AT",
    text: "The dashboard makes it easy to see all orders in one place. Tracking is accurate and my customers love the fast delivery. Much better than my previous agent.",
    stars: 5,
    metric: "12-day EU delivery",
  },
  {
    name: "Lena P.",
    role: "Fitness Brand",
    country: "🇦🇺 Australia",
    avatar: "LP",
    text: "Switched from another agent after one month. FastFulfill's platform is professional, responsive, and the team actually responds to questions — same day.",
    stars: 5,
    metric: "Same-day responses",
  },
  {
    name: "Carlos R.",
    role: "Multi-category Seller",
    country: "🇨🇦 Canada",
    avatar: "CR",
    text: "The private label support is the best part. They handle all the packaging design and coordination with the factory. My brand looks premium without the premium price.",
    stars: 5,
    metric: "Full private label",
  },
  {
    name: "Nadia B.",
    role: "Gadget Store",
    country: "🇫🇷 France",
    avatar: "NB",
    text: "Best sourcing platform I've used in 4 years. Quote turnaround is fast, pricing is always competitive, and I've never had a customs issue since switching.",
    stars: 5,
    metric: "0 customs issues",
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-white">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Results</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Sellers switching to FastFulfill
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Real results from sellers who moved from other platforms and agents.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="bg-gray-50 hover:bg-white rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all">
              {/* Stars */}
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>

              <p className="text-sm text-gray-700 leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role} · {t.country}</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-brand-600 bg-brand-50 border border-brand-100 px-2.5 py-1 rounded-full shrink-0">
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
