import { Zap, DollarSign, Shield, Globe, User, BarChart3 } from "lucide-react";

const BENEFITS = [
  {
    icon: Zap,
    title: "Fast Shipping",
    description: "7-15 day delivery to most markets with our express logistics network.",
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    icon: DollarSign,
    title: "Lower Costs",
    description: "Factory-direct pricing with no middlemen. Save 30-60% vs sourcing alone.",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: User,
    title: "Private Sourcing Agent",
    description: "A dedicated agent handles every sourcing request personally.",
    color: "bg-brand-50 text-brand-600",
  },
  {
    icon: Shield,
    title: "Quality Control",
    description: "Every shipment is inspected in our warehouse before it ships.",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: Globe,
    title: "Ship Worldwide",
    description: "We fulfill to 40+ countries with DDP shipping with no customs surprises.",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: BarChart3,
    title: "Full Visibility",
    description: "Real-time tracking, inventory counts, and analytics on one dashboard.",
    color: "bg-orange-50 text-orange-600",
  },
];

export function Benefits() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">Why Us</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900">
            Everything You Need to Scale
          </h2>
          <p className="mt-4 text-gray-500 max-w-xl mx-auto">
            Built for serious ecommerce brands and beginner dropshippers alike.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {BENEFITS.map(({ icon: Icon, title, description, color }) => (
            <div
              key={title}
              className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
                <Icon size={20} />
              </div>
              <h3 className="text-base font-bold text-gray-900 mb-1.5">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
