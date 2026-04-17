"use client";

import { useState } from "react";
import { Search, MapPin, CheckCircle2, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DUMMY_ORDERS, DUMMY_TRACKING_EVENTS } from "@/lib/dummy-data";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, formatDate } from "@/lib/utils";
import type { Order, TrackingEvent } from "@/types/database";

export default function PublicTrackingPage() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<{ order: Order; events: TrackingEvent[] } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setNotFound(false);
    setResult(null);
    setLoading(true);

    await new Promise((r) => setTimeout(r, 600));

    const order = DUMMY_ORDERS.find(
      (o) => o.tracking_number?.toLowerCase() === query.toLowerCase()
    );

    if (!order) {
      setNotFound(true);
    } else {
      const events = DUMMY_TRACKING_EVENTS.filter((e) => e.order_id === order.id);
      setResult({ order, events });
    }

    setLoading(false);
  }

  return (
    <div>
      {/* Header */}
      <section className="bg-gradient-to-br from-gray-50 to-brand-50 py-20 border-b border-gray-100">
        <div className="container-section text-center max-w-2xl">
          <div className="w-14 h-14 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Package size={26} className="text-brand-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3">Track Your Shipment</h1>
          <p className="text-gray-500 mb-8">Enter your tracking number to see real-time delivery updates.</p>

          <form onSubmit={handleSearch} className="flex gap-3 max-w-md mx-auto">
            <input
              className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 bg-white"
              placeholder="Enter tracking number..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
            />
            <Button type="submit" loading={loading}>
              <Search size={16} /> Track
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            Demo: try <button onClick={() => setQuery("YT2024123456CN")} className="underline">YT2024123456CN</button>
          </p>
        </div>
      </section>

      <div className="container-section py-12 max-w-2xl">
        {/* Not found */}
        {notFound && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
            <p className="font-semibold text-red-700">Tracking number not found</p>
            <p className="text-sm text-red-500 mt-1">
              Make sure you&apos;ve entered the correct number. It may take 24-48h to appear after shipping.
            </p>
          </div>
        )}

        {/* Result */}
        {result && (
          <div className="space-y-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-start justify-between mb-4 flex-wrap gap-3">
                <div>
                  <p className="text-xs text-gray-400 font-mono mb-1">{result.order.tracking_number}</p>
                  <h2 className="text-base font-bold text-gray-900">{result.order.product_name}</h2>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {result.order.quantity} units to {result.order.destination_country}
                  </p>
                </div>
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${ORDER_STATUS_COLORS[result.order.status]}`}>
                  {ORDER_STATUS_LABELS[result.order.status]}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-5">Delivery Timeline</h3>
              {result.events.length === 0 ? (
                <div className="flex items-center gap-3 text-sm text-gray-500 py-3">
                  <Clock size={18} className="text-gray-400" />
                  No tracking events yet.
                </div>
              ) : (
                <div className="relative">
                  {result.events.map((event, i) => (
                    <div key={event.id} className="flex gap-4 pb-6 relative">
                      {i < result.events.length - 1 && (
                        <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />
                      )}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${i === 0 ? "bg-brand-600" : "bg-gray-100"}`}>
                        {i === 0 ? (
                          <CheckCircle2 size={16} className="text-white" />
                        ) : (
                          <MapPin size={14} className="text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className={`text-sm font-semibold ${i === 0 ? "text-brand-700" : "text-gray-900"}`}>
                            {event.status}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(event.timestamp)}</p>
                        </div>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                            <MapPin size={11} /> {event.location}
                          </p>
                        )}
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!result && !notFound && !loading && (
          <div className="text-center py-10 text-gray-400">
            <Package size={36} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">Enter a tracking number above to see your shipment status.</p>
          </div>
        )}
      </div>
    </div>
  );
}
