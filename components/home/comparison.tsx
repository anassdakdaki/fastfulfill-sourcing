import { CheckCircle2, XCircle, MinusCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const ROWS = [
  {
    feature: "Per-unit cost",
    ff: "Factory direct",
    zendrop: "+$2 to $5 margin",
    cj: "+$1 to $4 margin",
    agent: "Varies / opaque",
  },
  {
    feature: "Shipping to USA",
    ff: "7 to 12 days",
    zendrop: "12 to 20 days",
    cj: "10 to 18 days",
    agent: "10 to 20 days",
  },
  {
    feature: "Shipping to UK / EU",
    ff: "8 to 14 days",
    zendrop: "15 to 25 days",
    cj: "12 to 22 days",
    agent: "12 to 25 days",
  },
  {
    feature: "Custom packaging",
    ff: "yes",
    zendrop: "no",
    cj: "partial",
    agent: "partial",
  },
  {
    feature: "Private label / branding",
    ff: "yes",
    zendrop: "no",
    cj: "no",
    agent: "partial",
  },
  {
    feature: "Physical QC inspection",
    ff: "yes",
    zendrop: "no",
    cj: "no",
    agent: "partial",
  },
  {
    feature: "Shopify auto-sync",
    ff: "yes",
    zendrop: "yes",
    cj: "yes",
    agent: "no",
  },
  {
    feature: "Monthly subscription",
    ff: "no",
    zendrop: "$49 to $299/mo",
    cj: "free (limited)",
    agent: "negotiated",
  },
  {
    feature: "Dedicated sourcing agent",
    ff: "yes",
    zendrop: "no",
    cj: "no",
    agent: "partial",
  },
  {
    feature: "Tracked dashboard",
    ff: "yes",
    zendrop: "yes",
    cj: "yes",
    agent: "no",
  },
];

function Cell({ value, highlight }: { value: string; highlight?: boolean }) {
  if (value === "yes") {
    return (
      <div className={`flex items-center justify-center gap-1.5 ${highlight ? "text-brand-600 dark:text-brand-400" : "text-gray-400"}`}>
        <CheckCircle2 size={16} className={highlight ? "text-brand-600 dark:text-brand-400" : "text-green-500"} />
        <span className="text-sm font-medium sr-only">Yes</span>
      </div>
    );
  }
  if (value === "no") {
    return (
      <div className="flex items-center justify-center text-gray-300 dark:text-gray-600">
        <XCircle size={16} />
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex items-center justify-center text-amber-400">
        <MinusCircle size={16} />
      </div>
    );
  }
  return (
    <span className={`text-sm font-medium ${highlight ? "text-brand-700 dark:text-brand-300 font-bold" : "text-gray-500 dark:text-gray-400"}`}>
      {value}
    </span>
  );
}

export function Comparison() {
  return (
    <section className="py-24 bg-gray-50 dark:bg-gray-900" id="compare">
      <div className="container-section">
        <div className="text-center mb-14">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand-600 mb-3">
            Why FastFulfill
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
            How we compare
          </h2>
          <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            Less cost. Faster shipping. Real quality control. Here&apos;s how FastFulfill
            stacks up against the alternatives.
          </p>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-900">
          <table className="w-full min-w-[680px]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-800">
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-500 dark:text-gray-400 w-40">Feature</th>
                <th className="px-6 py-4 text-center w-36">
                  <div className="inline-flex flex-col items-center gap-1">
                    <span className="text-xs font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 px-3 py-1 rounded-full">
                      FastFulfill
                    </span>
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400 dark:text-gray-500 w-36">Zendrop</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400 dark:text-gray-500 w-36">CJ Drop</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400 dark:text-gray-500 w-36">WeChat Agent</th>
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row, i) => (
                <tr
                  key={row.feature}
                  className={`border-b border-gray-50 dark:border-gray-800 last:border-0 ${
                    i % 2 === 0
                      ? "bg-white dark:bg-gray-900"
                      : "bg-gray-50/50 dark:bg-gray-800/50"
                  }`}
                >
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300">{row.feature}</td>
                  <td className="px-6 py-3.5 text-center bg-brand-50/40 dark:bg-brand-900/10">
                    <Cell value={row.ff} highlight />
                  </td>
                  <td className="px-6 py-3.5 text-center"><Cell value={row.zendrop} /></td>
                  <td className="px-6 py-3.5 text-center"><Cell value={row.cj} /></td>
                  <td className="px-6 py-3.5 text-center"><Cell value={row.agent} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-6 justify-end text-xs text-gray-400 dark:text-gray-500">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-green-500" /> Available</span>
          <span className="flex items-center gap-1.5"><MinusCircle size={13} className="text-amber-400" /> Partial / extra cost</span>
          <span className="flex items-center gap-1.5"><XCircle size={13} className="text-gray-300 dark:text-gray-600" /> Not available</span>
        </div>

        <div className="mt-8 text-center">
          <Link href="/auth/signup">
            <Button size="lg">Get a Free Quote in 24h</Button>
          </Link>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">No credit card. No monthly fee. Just the quote.</p>
        </div>
      </div>
    </section>
  );
}
