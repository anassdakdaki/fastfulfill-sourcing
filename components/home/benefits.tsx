import { Zap, DollarSign, Shield, Globe, User, Package2 } from "lucide-react";

const BENEFITS = [
  {
    icon: User,
    title: "Dedicated Sourcing Agent",
    description: "A real person in China handles your requests, negotiates with factories, and keeps you updated. Not a ticket queue.",
    color: "bg-brand-50 text-brand-600 border-brand-100",
    highlight: true,
  },
  {
    icon: DollarSign,
    title: "Factory-Direct Pricing",
    description: "No Zendrop markup. No Alibaba middlemen. You pay what the factory charges, plus our transparent fulfillment fee.",
    color: "bg-green-50 text-green-600 border-green-100",
    highlight: false,
  },
  {
    icon: Zap,
    title: "7–12 Day Delivery",
    description: "US, UK, EU, Australia. Real shipping timelines — not the inflated estimates you see on dropshipping platforms.",
    color: "bg-yellow-50 text-yellow-600 border-yellow-100",
    highlight: false,
  },
  {
    icon: Shield,
    title: "Physical QC Inspection",
    description: "Every order is inspected in our Shenzhen warehouse before it ships. Defects are caught before they reach your customers.",
    color: "bg-purple-50 text-purple-600 border-purple-100",
    highlight: false,
  },
  {
    icon: Package2,
    title: "Custom Packaging & Branding",
    description: "Your logo. Your box. Your inserts. Private label orders welcome. We coordinate everything with the factory.",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    highlight: false,
  },
  {
    icon: Globe,
    title: "Shopify Auto-Fulfillment",
    description: "Orders sync from your Shopify store automatically. No manual CSV exports. Tracking numbers push back to customers.",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    highlight: false,
  },
];

export function Benefits() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Why Us</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            The infrastructure behind<br className="hidden md:block" /> serious Shopify brands
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Not a platform. Not a middleman. A repeatable, traceable system you run from one dashboard.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {BENEFITS.map(({ icon: Icon, title, description, color, highlight }) => (
            <div
              key={title}
              className={`bg-white rounded-2xl p-6 border shadow-sm hover:shadow-md transition-all ${
                highlight ? "border-brand-200 ring-1 ring-brand-100" : "border-gray-100"
              }`}
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 border ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
