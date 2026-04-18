"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, CheckCircle2, Clock, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { searchTracking, loadActiveShipments } from "@/app/actions/tracking";
import { ORDER_STATUS_COLORS, ORDER_STATUS_LABELS, formatDate } from "@/lib/utils";
import type { Order, TrackingEvent } from "@/types/database";

export default function TrackingPage() {
  const [query,      setQuery]      = useState("");
  const [searching,  setSearching]  = useState(false);
  const [result,     setResult]     = useState<{ order: Order; events: TrackingEvent[] } | null>(null);
  const [notFound,   setNotFound]   = useState(false);
  const [shipments,  setShipments]  = useState<Order[]>([]);
  const [loadingList, setLoadingList] = useState(true);

  useEffect(() => {
    loadActiveShipments().then(({ data }) => {
      setShipments(data as Order[]);
      setLoadingList(false);
    });
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setNotFound(false);
    setResult(null);

    const { order, events } = await searchTracking(query.trim());

    if (!order) {
      setNotFound(true);
    } else {
      setResult({ order: order as Order, events: events as TrackingEvent[] });
    }
    setSearching(false);
  }

  function quickTrack(order: Order) {
    setQuery(order.tracking_number ?? order.id);
    setResult({ order, events: [] });
    setNotFound(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Shipment Tracking</h1>
        <p className="text-sm text-gray-500 mt-0.5">Enter a tracking number or order ID to see real-time updates.</p>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <Input
          placeholder="Enter tracking number or order ID…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <Button type="submit" loading={searching}>
          <Search size={15} /> Track
        </Button>
      </form>

      {/* Not found */}
      {notFound && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 text-sm text-red-700">
          No shipment found for <strong>&ldquo;{query}&rdquo;</strong>. Double-check the tracking number.
        </div>
      )}

      {/* Search Result */}
      {result && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-gray-400 font-mono mb-1">{result.order.tracking_number ?? result.order.id}</p>
                <h2 className="text-base font-bold text-gray-900">{result.order.product_name}</h2>
                <p className="text-sm text-gray-500 mt-0.5">
                  {result.order.quantity} units · {result.order.destination_country}
                </p>
              </div>
              <Badge className={ORDER_STATUS_COLORS[result.order.status] ?? "bg-gray-100 text-gray-600"}>
                {ORDER_STATUS_LABELS[result.order.status] ?? result.order.status}
              </Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Order Date</p>
                <p className="text-gray-700">{formatDate(result.order.created_at)}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Last Updated</p>
                <p className="text-gray-700">{formatDate(result.order.updated_at)}</p>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-5">Shipping Timeline</h3>
            {result.events.length === 0 ? (
              <div className="flex items-center gap-3 text-sm text-gray-500 py-4">
                <Clock size={18} className="text-gray-400" />
                No tracking events yet. Check back soon after the order is shipped.
              </div>
            ) : (
              <div className="relative">
                {result.events.map((event, i) => {
                  const isLast = i === result.events.length - 1;
                  return (
                    <div key={event.id} className="flex gap-4 pb-6 relative">
                      {!isLast && <div className="absolute left-4 top-8 bottom-0 w-px bg-gray-200" />}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 ${i === 0 ? "bg-brand-600" : "bg-gray-100"}`}>
                        {i === 0 ? <CheckCircle2 size={16} className="text-white" /> : <MapPin size={14} className="text-gray-400" />}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-baseline justify-between gap-2 flex-wrap">
                          <p className={`text-sm font-semibold ${i === 0 ? "text-brand-700" : "text-gray-900"}`}>{event.status}</p>
                          <p className="text-xs text-gray-400">{formatDate(event.timestamp)}</p>
                        </div>
                        {event.location && (
                          <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1"><MapPin size={11} /> {event.location}</p>
                        )}
                        {event.description && (
                          <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Active shipments list */}
      {!result && !notFound && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-900">Active Shipments</h2>
          </div>
          {loadingList ? (
            <div className="py-12 flex items-center justify-center gap-2 text-gray-400">
              <Loader2 size={18} className="animate-spin" /> Loading shipments…
            </div>
          ) : shipments.length === 0 ? (
            <div className="py-12 flex flex-col items-center gap-3 text-center">
              <Package size={28} className="text-gray-300" />
              <p className="text-sm text-gray-400">No active shipments yet.</p>
              <p className="text-xs text-gray-400">Shipments appear here once your orders are picked and shipped.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {shipments.map((order) => (
                <div key={order.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-brand-50 rounded-xl flex items-center justify-center">
                      <Package size={17} className="text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.product_name}</p>
                      <p className="text-xs text-gray-400 font-mono">{order.tracking_number}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={ORDER_STATUS_COLORS[order.status] ?? "bg-gray-100 text-gray-600"}>
                      {ORDER_STATUS_LABELS[order.status] ?? order.status}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => quickTrack(order)}>
                      <Search size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
