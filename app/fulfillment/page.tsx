import { Archive, CheckCircle2, ClipboardList, PackageCheck, Truck } from "lucide-react";
import { loadFulfillmentQueue, loadInboundShipments } from "@/app/actions/fulfillment";
import type { FulfillmentQueueOrder, InboundShipment } from "@/types/database";

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-200",
  packed: "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-200",
  shipped: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-200",
  delivered: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300",
};

export default async function FulfillmentOverview() {
  const [{ data: queue, error: queueError }, { data: inbound, error: inboundError }] = await Promise.all([
    loadFulfillmentQueue(),
    loadInboundShipments(),
  ]);

  const orders = queue as FulfillmentQueueOrder[];
  const inboundShipments = inbound as InboundShipment[];
  const toPack = orders.filter((o) => o.status === "pending").length;
  const toShip = orders.filter((o) => o.status === "packed").length;
  const shipped = orders.filter((o) => o.status === "shipped").length;
  const delivered = orders.filter((o) => o.status === "delivered").length;
  const inboundActive = inboundShipments.filter((s) => s.status === "pending" || s.status === "in_transit");
  const priorityQueue = orders.filter((o) => o.status === "pending" || o.status === "packed").slice(0, 5);

  const stats = [
    { label: "To Pack", value: toPack, icon: ClipboardList, accent: "bg-amber-500", textColor: "text-amber-700 dark:text-amber-300", bg: "bg-amber-50 dark:bg-amber-950/30" },
    { label: "To Ship", value: toShip, icon: Truck, accent: "bg-blue-500", textColor: "text-blue-700 dark:text-blue-300", bg: "bg-blue-50 dark:bg-blue-950/30" },
    { label: "Shipped", value: shipped, icon: PackageCheck, accent: "bg-green-500", textColor: "text-green-700 dark:text-green-300", bg: "bg-green-50 dark:bg-green-950/30" },
    { label: "Delivered", value: delivered, icon: CheckCircle2, accent: "bg-purple-500", textColor: "text-purple-700 dark:text-purple-300", bg: "bg-purple-50 dark:bg-purple-950/30" },
  ];

  return (
    <div className="py-8 px-6 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Warehouse Overview</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Live fulfillment queue and inbound shipment status.</p>
      </div>

      {(queueError || inboundError) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {queueError ?? inboundError}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5 relative overflow-hidden">
            <div className={`absolute top-0 left-0 right-0 h-1 ${s.accent}`} />
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center mb-3`}>
              <s.icon size={18} className={s.textColor} />
            </div>
            <p className={`text-3xl font-bold ${s.textColor}`}>{s.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 font-medium">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <ClipboardList size={16} className="text-amber-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Priority Pack and Ship</h2>
          <span className="ml-auto badge bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-200">{priorityQueue.length} orders</span>
        </div>
        {priorityQueue.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
            No pending or packed orders right now.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {["Order Ref", "Product", "SKU", "Qty", "Ship To", "Status", "Tracking"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {priorityQueue.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-400">{order.ref}</td>
                    <td className="px-5 py-3.5 font-medium text-gray-900 dark:text-white max-w-[160px] truncate">{order.product_name}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">{order.sku}</td>
                    <td className="px-5 py-3.5 text-gray-700 dark:text-gray-300">{order.quantity}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-400">{order.ship_to_country}</td>
                    <td className="px-5 py-3.5">
                      <span className={`badge ${STATUS_BADGE[order.status]}`}>{order.status}</span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500 dark:text-gray-400">{order.tracking_number ?? "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-2">
          <Archive size={16} className="text-slate-500" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Expected Inbound</h2>
          <span className="ml-auto badge bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">{inboundActive.length} shipments</span>
        </div>
        {inboundActive.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-gray-400 dark:text-gray-500">No inbound shipments expected soon.</div>
        ) : (
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {inboundActive.map((shipment) => (
              <div key={shipment.id} className="px-5 py-4 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md shrink-0 dark:bg-gray-800 dark:text-gray-300">
                  {shipment.ref}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{shipment.product_name}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{shipment.sku} | {shipment.quantity_expected} units expected</p>
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">
                  Due {new Date(shipment.expected_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                </span>
                <span className={`badge shrink-0 ${shipment.status === "in_transit" ? "bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200" : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"}`}>
                  {shipment.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
