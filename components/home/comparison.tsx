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
    feature: "Logo and brand packaging",
    ff: "yes",
    zendrop: "no",
    cj: "no",
    agent: "partial",
  },
  {
    feature: "Quality check before shipping",
    ff: "yes",
    zendrop: "no",
    cj: "no",
    agent: "partial",
  },
  {
    feature: "Store auto-sync",
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
    feature: "Product helper",
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

function Cell({ value, highlight, compact }: { value: string; highlight?: boolean; compact?: boolean }) {
  if (value === "yes") {
    return (
      <div className={`flex items-center justify-center gap-1.5 ${highlight ? "text-brand-600 dark:text-brand-400" : "text-gray-400"}`}>
        <CheckCircle2 size={compact ? 15 : 16} className={highlight ? "text-brand-600 dark:text-brand-400" : "text-green-500"} />
        <span className="text-sm font-medium sr-only">Yes</span>
      </div>
    );
  }
  if (value === "no") {
    return (
      <div className="flex items-center justify-center text-gray-300 dark:text-gray-600">
        <XCircle size={compact ? 15 : 16} />
      </div>
    );
  }
  if (value === "partial") {
    return (
      <div className="flex items-center justify-center text-amber-400">
        <MinusCircle size={compact ? 15 : 16} />
      </div>
    );
  }
  return (
    <span className={`break-words font-medium ${compact ? "text-xs leading-5" : "text-sm"} ${highlight ? "font-bold text-brand-700 dark:text-brand-300" : "text-gray-500 dark:text-gray-400"}`}>
      {value}
    </span>
  );
}

function MobileValue({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`min-w-0 rounded-2xl border p-3 ${
        highlight
          ? "border-brand-200 bg-gradient-to-br from-brand-50 to-white shadow-sm shadow-brand-100/60 dark:border-brand-700/80 dark:from-brand-900/55 dark:to-gray-950 dark:shadow-none"
          : "border-gray-100 bg-gray-50/80 dark:border-gray-800 dark:bg-gray-950/50"
      }`}
    >
      <p className={`truncate text-[11px] font-bold uppercase tracking-wider ${highlight ? "text-brand-600 dark:text-brand-300" : "text-gray-400 dark:text-gray-500"}`}>
        {label}
      </p>
      <div className="mt-2 flex min-h-5 items-center justify-start">
        <Cell value={value} highlight={highlight} compact={!highlight} />
      </div>
    </div>
  );
}

function MobileComparisonCard({
  row,
  index,
}: {
  row: (typeof ROWS)[number];
  index: number;
}) {
  return (
    <article className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-start gap-3 border-b border-gray-100 bg-gray-50/70 p-4 dark:border-gray-800 dark:bg-gray-950/30">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-xs font-black text-white">
          {index + 1}
        </span>
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
            Feature
          </p>
          <h3 className="mt-0.5 text-base font-extrabold leading-5 text-gray-900 dark:text-white">
            {row.feature}
          </h3>
        </div>
      </div>

      <div className="space-y-3 p-3">
        <MobileValue label="FastFulfill" value={row.ff} highlight />
        <div className="grid grid-cols-3 gap-2">
          <MobileValue label="Zendrop" value={row.zendrop} />
          <MobileValue label="CJ Drop" value={row.cj} />
          <MobileValue label="Agent" value={row.agent} />
        </div>
      </div>
    </article>
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
            Lower prices, faster shipping, and product checks before delivery.
          </p>
        </div>

        <div className="space-y-4 md:hidden">
          {ROWS.map((row, index) => (
            <MobileComparisonCard key={row.feature} row={row} index={index} />
          ))}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-full rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  <th className="w-40 px-6 py-4 text-left text-sm font-semibold text-gray-500 dark:text-gray-400">Feature</th>
                  <th className="w-36 px-6 py-4 text-center">
                    <div className="inline-flex flex-col items-center gap-1">
                      <span className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-black uppercase tracking-widest text-brand-600 dark:border-brand-800 dark:bg-brand-900/30 dark:text-brand-400">
                        FastFulfill
                      </span>
                    </div>
                  </th>
                  <th className="w-36 px-6 py-4 text-center text-sm font-semibold text-gray-400 dark:text-gray-500">Zendrop</th>
                  <th className="w-36 px-6 py-4 text-center text-sm font-semibold text-gray-400 dark:text-gray-500">CJ Drop</th>
                  <th className="w-36 px-6 py-4 text-center text-sm font-semibold text-gray-400 dark:text-gray-500">WeChat Agent</th>
                </tr>
              </thead>
              <tbody>
                {ROWS.map((row, i) => (
                  <tr
                    key={row.feature}
                    className={`border-b border-gray-50 last:border-0 dark:border-gray-800 ${
                      i % 2 === 0
                        ? "bg-white dark:bg-gray-900"
                        : "bg-gray-50/50 dark:bg-gray-800/50"
                    }`}
                  >
                    <td className="px-6 py-3.5 text-sm font-medium text-gray-700 dark:text-gray-300">{row.feature}</td>
                    <td className="bg-brand-50/40 px-6 py-3.5 text-center dark:bg-brand-900/10">
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
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400 dark:text-gray-500 sm:justify-end sm:gap-6">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-green-500" /> Available</span>
          <span className="flex items-center gap-1.5"><MinusCircle size={13} className="text-amber-400" /> Partial / extra cost</span>
          <span className="flex items-center gap-1.5"><XCircle size={13} className="text-gray-300 dark:text-gray-600" /> Not available</span>
        </div>

        <div className="mt-8 text-center">
          <Link href="/auth/signup">
            <Button size="lg">Get a Free Product Price in 24h</Button>
          </Link>
          <p className="mt-3 text-xs text-gray-400 dark:text-gray-500">No credit card. No monthly fee. Just a clear price.</p>
        </div>
      </div>
    </section>
  );
}
