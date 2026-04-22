import { Package, Truck, CheckCircle2, FileText, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { createClient } from "@/lib/supabase/server";
import {
  FULFILLMENT_STATUS_COLORS,
  FULFILLMENT_STATUS_LABELS,
  SHIPPING_METHOD_LABELS,
  formatCurrency,
  formatDate,
} from "@/lib/utils";
import type { FulfillmentOrder } from "@/types/database";

type FulfillmentRow = Omit<FulfillmentOrder, "items"> & {
  fulfillment_items?: { product_name: string; sku: string | null; quantity: number }[];
};

const DESTINATION_TYPE_LABELS: Record<string, string> = {
  amazon_fba: "Amazon FBA",
  customer: "Direct to customer",
  "3pl": "External warehouse",
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
  draft: <FileText size={14} />,
  processing: <Package size={14} />,
  shipped: <Truck size={14} />,
  delivered: <CheckCircle2 size={14} />,
};

async function loadFulfillmentOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fulfillment_orders")
    .select("*, fulfillment_items(product_name, sku, quantity)")
    .order("created_at", { ascending: false });

  return { data: (data ?? []) as FulfillmentRow[], error: error?.message ?? null };
}

export default async function FulfillmentPage() {
  const { data: orders, error } = await loadFulfillmentOrders();

  const stats = {
    total: orders.length,
    processing: orders.filter((o) => o.status === "processing").length,
    shipped: orders.filter((o) => o.status === "shipped").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fulfillment</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Ship stored inventory to Amazon FBA or directly to customers.
          </p>
        </div>
        <Link href="/dashboard/source">
          <Button size="sm">
            <Plus size={15} /> Request product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: "Total Orders", value: stats.total, color: "text-gray-900 dark:text-white" },
          { label: "Processing", value: stats.processing, color: "text-blue-600 dark:text-blue-300" },
          { label: "Shipped", value: stats.shipped, color: "text-purple-600 dark:text-purple-300" },
          { label: "Delivered", value: stats.delivered, color: "text-green-600 dark:text-green-300" },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 dark:bg-gray-900 dark:border-gray-800">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{s.label}</p>
            <p className={`text-2xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-brand-100 bg-brand-50 px-5 py-4 dark:border-brand-900 dark:bg-brand-950/30">
        <p className="text-sm font-semibold text-brand-900 dark:text-brand-100">How fulfillment starts</p>
        <p className="mt-1 text-xs leading-5 text-brand-700 dark:text-brand-300">
          Submit a product request, accept the quote, and FastFulfill stores the units in our warehouse. Fulfillment orders appear here once inventory is ready to ship.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden dark:bg-gray-900 dark:border-gray-800">
        {error ? (
          <EmptyState icon={<Search size={28} />} title="Fulfillment unavailable" description={error} />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={<Package size={28} />}
            title="No fulfillment orders yet"
            description="Connect Shopify or submit your first product request to start moving inventory into fulfillment."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-800/50">
                  {["Items", "Destination", "Type", "Shipping", "Status", "Est. Cost", "Est. Delivery", "Tracking"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="space-y-0.5">
                        {(order.fulfillment_items ?? []).map((item, i) => (
                          <p key={`${order.id}-${i}`} className="text-sm font-medium text-gray-900 dark:text-white whitespace-nowrap">
                            {item.product_name} <span className="font-normal text-gray-500 dark:text-gray-400">x {item.quantity}</span>
                          </p>
                        ))}
                        {(order.fulfillment_items ?? []).length === 0 && (
                          <span className="text-gray-400">No items attached</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-[180px]">
                      <p className="truncate">{order.destination_address}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{DESTINATION_TYPE_LABELS[order.destination_type]}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">{SHIPPING_METHOD_LABELS[order.shipping_method]}</td>
                    <td className="px-6 py-4">
                      <Badge className={FULFILLMENT_STATUS_COLORS[order.status]}>
                        <span className="flex items-center gap-1">
                          {STATUS_ICONS[order.status]}
                          {FULFILLMENT_STATUS_LABELS[order.status]}
                        </span>
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {order.estimated_cost ? formatCurrency(order.estimated_cost) : "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {order.estimated_delivery ? formatDate(order.estimated_delivery) : "-"}
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {order.tracking_number ?? "-"}
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
