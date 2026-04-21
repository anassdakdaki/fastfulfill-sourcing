import { Zap, DollarSign, Shield, Globe, User, Package2 } from "lucide-react";

const BENEFITS = [
  {
    icon: User,
    title: "Your Own Product Helper",
    description: "A real person in China helps with your product, talks to factories, and keeps you updated.",
    color: "bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-900/30 dark:text-brand-400 dark:border-brand-800",
    highlight: true,
  },
  {
    icon: DollarSign,
    title: "Lower Product Prices",
    description: "No hidden markup. We show the product cost and our service fee clearly before you order.",
    color: "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800",
    highlight: false,
  },
  {
    icon: Zap,
    title: "7 to 12 Day Delivery",
    description: "US, UK, EU, Australia. Real shipping timelines without the inflated estimates you see on dropshipping platforms.",
    color: "bg-yellow-50 text-yellow-600 border-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800",
    highlight: false,
  },
  {
    icon: Shield,
    title: "Quality Check Before Shipping",
    description: "We check products in our Shenzhen warehouse before they ship, so problems are caught early.",
    color: "bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/30 dark:text-purple-400 dark:border-purple-800",
    highlight: false,
  },
  {
    icon: Package2,
    title: "Custom Packaging",
    description: "Your logo, box, cards, and labels. We help arrange the packaging with the factory.",
    color: "bg-orange-50 text-orange-600 border-orange-100 dark:bg-orange-900/30 dark:text-orange-400 dark:border-orange-800",
    highlight: false,
  },
  {
    icon: Globe,
    title: "Orders Come In Automatically",
    description: "Orders sync from Shopify, TikTok Shop, Amazon, WooCommerce, and custom stores. No manual files. Tracking goes back to customers.",
    color: "bg-blue-50 text-blue-600 border-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800",
    highlight: false,
  },
];

export function Benefits() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Why Us</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            The infrastructure behind<br className="hidden md:block" /> serious ecommerce brands
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            One clear place to manage products, orders, shipping, and tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map(({ icon: Icon, title, description, color, highlight }) => (
            <div
              key={title}
              className={`bg-white dark:bg-gray-800 rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all ${
                highlight
                  ? "border-brand-200 dark:border-brand-800 ring-1 ring-brand-100 dark:ring-brand-900"
                  : "border-gray-100 dark:border-gray-700"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
