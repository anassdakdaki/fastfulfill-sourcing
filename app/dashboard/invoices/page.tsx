"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { Download, FileText, Search, AlertTriangle, Loader2, CheckCircle2, CreditCard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { loadMyInvoices, expireOldQuotes } from "@/app/actions/invoices";
import { INVOICE_STATUS_COLORS, formatDate, formatCurrency } from "@/lib/utils";
import type { Invoice } from "@/types/database";
import { useSearchParams } from "next/navigation";

const STATUS_FILTERS = [
  { value: "all",     label: "All"     },
  { value: "issued",  label: "Issued"  },
  { value: "paid",    label: "Paid"    },
  { value: "overdue", label: "Overdue" },
];

function escapeCSV(val: string | number | null): string {
  if (val === null || val === undefined) return "";
  const s = String(val);
  if (s.includes(",") || s.includes('"') || s.includes("\n")) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function InvoicesContent() {
  const searchParams = useSearchParams();
  const justPaid     = searchParams.get("paid");

  const [invoices,    setInvoices]    = useState<Invoice[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [filter,      setFilter]      = useState("all");
  const [search,      setSearch]      = useState("");
  const [paying,      setPaying]      = useState<string | null>(null);
  const [paidBanner,  setPaidBanner]  = useState(!!justPaid);

  useEffect(() => {
    expireOldQuotes().then(() =>
      loadMyInvoices().then(({ data }) => {
        setInvoices(data as Invoice[]);
        setLoading(false);
      })
    );
    if (justPaid) setTimeout(() => setPaidBanner(false), 6000);
  }, [justPaid]);

  const filtered = useMemo(() =>
    invoices.filter((inv) => {
      const matchFilter = filter === "all" || inv.status === filter;
      const matchSearch =
        inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
        inv.description.toLowerCase().includes(search.toLowerCase());
      return matchFilter && matchSearch;
    }),
    [invoices, filter, search]
  );

  const totalPaid        = invoices.filter((i) => i.status === "paid").reduce((s, i) => s + Number(i.total), 0);
  const totalOutstanding = invoices.filter((i) => i.status === "issued" || i.status === "overdue").reduce((s, i) => s + Number(i.total), 0);
  const overdue          = invoices.filter((i) => i.status === "overdue").length;

  async function handlePayNow(invoiceId: string) {
    setPaying(invoiceId);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ invoiceId }),
      });
      const { url, error } = await res.json();
      if (url) window.location.href = url;
      else console.error("Checkout error:", error);
    } catch (err) {
      console.error(err);
    }
    setPaying(null);
  }

  function handleExport() {
    const header = ["Invoice #", "Description", "Subtotal", "Shipping", "Total", "Status", "Issued", "Due"];
    const lines  = [
      header.join(","),
      ...filtered.map((inv) =>
        [inv.invoice_number, inv.description, inv.subtotal, inv.shipping_cost, inv.total, inv.status,
         new Date(inv.issued_at).toISOString().split("T")[0],
         inv.due_at ? new Date(inv.due_at).toISOString().split("T")[0] : ""]
          .map(escapeCSV).join(",")
      ),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href = url; a.download = `fastfulfill-invoices-${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-sm text-gray-500 mt-0.5">Billing history for your sourcing orders. Invoices are generated automatically when you accept a quote.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleExport} disabled={filtered.length === 0}>
          <Download size={14} /> Export CSV
        </Button>
      </div>

      {/* Payment success banner */}
      {paidBanner && (
        <div className="bg-green-50 border border-green-200 rounded-2xl px-5 py-3.5 flex items-center gap-3 text-green-800">
          <CheckCircle2 size={18} className="text-green-600 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Payment successful!</p>
            <p className="text-xs text-green-700 mt-0.5">Your invoice has been marked as paid. We&apos;ll begin processing your order.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-1 flex items-center gap-2">
            {formatCurrency(totalPaid)}
            {totalPaid > 0 && <CheckCircle2 size={16} className="text-green-500" />}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Outstanding</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(totalOutstanding)}</p>
        </div>
        <div className={`rounded-2xl border shadow-sm p-5 ${overdue > 0 ? "bg-red-50 border-red-200" : "bg-white border-gray-100"}`}>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Overdue</p>
          <p className={`text-2xl font-bold mt-1 ${overdue > 0 ? "text-red-600" : "text-gray-900"}`}>{overdue}</p>
          {overdue > 0 && (
            <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
              <AlertTriangle size={11} /> Action required
            </p>
          )}
        </div>
      </div>

      {/* How invoices work banner */}
      {!loading && invoices.length === 0 && (
        <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-2xl px-5 py-4 text-sm text-blue-900">
          <FileText size={16} className="shrink-0 mt-0.5 text-blue-500" />
          <div>
            <p className="font-semibold">Invoices are generated automatically</p>
            <p className="text-xs text-blue-800 mt-1">
              When you accept a quote in the Quotes section, FastFulfill automatically creates an invoice
              for the total cost. You&apos;ll see it here immediately with payment terms.
            </p>
          </div>
        </div>
      )}

      {/* Filters + search */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s.value}
              onClick={() => setFilter(s.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                filter === s.value ? "bg-brand-600 text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {s.label}
              {s.value !== "all" && !loading && (
                <span className="ml-1 opacity-70">{invoices.filter((i) => i.status === s.value).length}</span>
              )}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            placeholder="Search invoices..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <Loader2 size={24} className="animate-spin text-gray-400" />
            <p className="text-sm text-gray-400">Loading invoices...</p>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<FileText size={28} />}
            title="No invoices yet"
            description="Accept a quote to generate your first invoice automatically."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Invoice #", "Description", "Subtotal", "Shipping", "Total", "Status", "Issued", "Due", ""].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((inv) => (
                  <tr key={inv.id} className={`transition-colors ${inv.status === "overdue" ? "bg-red-50/40 hover:bg-red-50" : "hover:bg-gray-50"}`}>
                    <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700 whitespace-nowrap">{inv.invoice_number}</td>
                    <td className="px-6 py-4 text-gray-700 max-w-[200px]">
                      <p className="truncate">{inv.description}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatCurrency(Number(inv.subtotal))}</td>
                    <td className="px-6 py-4 text-gray-600 whitespace-nowrap">{formatCurrency(Number(inv.shipping_cost))}</td>
                    <td className="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">{formatCurrency(Number(inv.total))}</td>
                    <td className="px-6 py-4">
                      <Badge className={INVOICE_STATUS_COLORS[inv.status as keyof typeof INVOICE_STATUS_COLORS] ?? "bg-gray-100 text-gray-600"}>
                        {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">{formatDate(inv.issued_at)}</td>
                    <td className={`px-6 py-4 whitespace-nowrap font-medium ${inv.status === "overdue" ? "text-red-600" : "text-gray-500"}`}>
                          {inv.due_at ? formatDate(inv.due_at) : "Not set"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {inv.status !== "paid" ? (
                        <Button
                          size="sm"
                          loading={paying === inv.id}
                          onClick={() => handlePayNow(inv.id)}
                          className={inv.status === "overdue" ? "bg-red-600 hover:bg-red-700 text-white" : ""}
                        >
                          <CreditCard size={13} />
                          {inv.status === "overdue" ? "Pay Now" : "Pay"}
                          <ExternalLink size={11} className="opacity-60" />
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-gray-700">
                          <Download size={14} />
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default function InvoicesPage() {
  return (
    <Suspense>
      <InvoicesContent />
    </Suspense>
  );
}
