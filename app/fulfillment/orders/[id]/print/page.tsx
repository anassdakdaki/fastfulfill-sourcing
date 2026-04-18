import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Package, MapPin, Truck, Calendar, Hash } from "lucide-react";

export default async function PackingSlipPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("fulfillment_queue")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!order) notFound();

  const shipping = order.shipping_address as Record<string, string> | null;
  const printDate = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>

      {/* Print button */}
      <div className="no-print fixed top-4 right-4 flex gap-2 z-10">
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-colors"
        >
          🖨 Print Slip
        </button>
        <button
          onClick={() => window.close()}
          className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          ✕ Close
        </button>
      </div>

      <div className="min-h-screen bg-white p-10 max-w-2xl mx-auto font-sans">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b-2 border-gray-900">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
                <Package size={14} className="text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">FastFulfill</span>
            </div>
            <p className="text-xs text-gray-500">Fulfillment Center</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 tracking-tight">PACKING SLIP</p>
            <p className="text-xs text-gray-500 mt-1">{printDate}</p>
          </div>
        </div>

        {/* Order ref + status */}
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
              <Hash size={9} /> Order Reference
            </p>
            <p className="text-xl font-bold font-mono text-gray-900">{order.ref}</p>
            <p className={`text-xs font-semibold mt-1 uppercase tracking-wide ${
              order.status === "shipped"   ? "text-green-600" :
              order.status === "packed"    ? "text-blue-600"  :
              order.status === "delivered" ? "text-gray-500"  : "text-yellow-600"
            }`}>
              ● {order.status}
            </p>
          </div>
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1 flex items-center gap-1">
              <Calendar size={9} /> Received
            </p>
            <p className="text-sm font-medium text-gray-700">
              {new Date(order.received_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </p>
            {order.shipped_at && (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mt-2 mb-0.5">Shipped</p>
                <p className="text-sm font-medium text-gray-700">
                  {new Date(order.shipped_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Ship to */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
            <MapPin size={9} /> Ship To
          </p>
          <div className="border border-gray-200 rounded-xl p-4">
            {order.customer_name && (
              <p className="text-base font-bold text-gray-900">{order.customer_name}</p>
            )}
            {order.customer_email && (
              <p className="text-xs text-gray-500 mt-0.5">{order.customer_email}</p>
            )}
            {shipping ? (
              <div className="mt-2 text-sm text-gray-700 leading-relaxed">
                {shipping.line1 && <p>{shipping.line1}</p>}
                {shipping.line2 && <p>{shipping.line2}</p>}
                <p>
                  {[shipping.city, shipping.state, shipping.zip].filter(Boolean).join(", ")}
                </p>
                {shipping.country && <p className="font-medium">{shipping.country}</p>}
                {shipping.phone && <p className="text-gray-500 text-xs mt-1">📞 {shipping.phone}</p>}
              </div>
            ) : (
              <p className="text-sm text-gray-500 mt-1">{order.ship_to_country}</p>
            )}
          </div>
        </div>

        {/* Items */}
        <div className="mb-8">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
            <Package size={9} /> Items
          </p>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Product</th>
                <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">SKU</th>
                <th className="text-right py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Qty</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-3 font-medium text-gray-900">{order.product_name}</td>
                <td className="py-3 font-mono text-xs text-gray-500">{order.sku}</td>
                <td className="py-3 text-right font-bold text-gray-900">{order.quantity}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tracking */}
        {order.tracking_number && (
          <div className="mb-8 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-green-700 mb-1 flex items-center gap-1">
              <Truck size={9} /> Tracking Number
            </p>
            <p className="text-base font-bold font-mono text-green-800">{order.tracking_number}</p>
          </div>
        )}

        {/* Footer */}
        <div className="pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            Thank you for your order · FastFulfill Fulfillment Center
          </p>
          <p className="text-[10px] text-gray-300 mt-1">
            For support: support@fastfulfill.com
          </p>
        </div>
      </div>
    </>
  );
}
