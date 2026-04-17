const STATS = [
  { value: "2,400+", label: "Active Sellers" },
  { value: "$12M+",  label: "Products Sourced" },
  { value: "98%",    label: "On-time Delivery" },
  { value: "40+",    label: "Countries Served" },
];

export function Stats() {
  return (
    <section className="py-16 bg-brand-600">
      <div className="container-section">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl md:text-4xl font-black text-white">{value}</p>
              <p className="mt-1.5 text-sm font-medium text-brand-200">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
