const STATS = [
  { value: "24h", label: "Quote turnaround", sub: "guaranteed" },
  { value: "7 to 12", label: "Days to USA / EU", sub: "avg delivery" },
  { value: "40+", label: "Countries fulfilled", sub: "DDP shipping" },
  { value: "0", label: "Monthly fee", sub: "pay per order" },
];

export function Stats() {
  return (
    <section className="py-16 bg-gradient-to-r from-slate-900 to-indigo-900">
      <div className="container-section">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map(({ value, label, sub }) => (
            <div key={label} className="text-center">
              <p className="text-4xl md:text-5xl font-black text-white">{value}</p>
              <p className="mt-1.5 text-sm font-semibold text-slate-200">{label}</p>
              <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
