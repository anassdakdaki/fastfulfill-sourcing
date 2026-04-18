import { ShoppingCart, Truck, Search, ArrowRight, Plug, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadDashboardOverview, loadDashboardStats } from "@/app/actions/dashboard";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, SOURCE_STATUS_COLORS, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const [stats, overview] = await Promise.all([
    loadDashboardStats(),
    loadDashboardOverview(),
  ]);

  const { recentOrders, recentRequests, hasConnectedStore } = overview;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Overview</h1>
          <p className="text-sm text-gray-500 mt-0.5">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/dashboard/source">
          <Button size="sm">
            <Search size={15} />
            New Request
          </Button>
        </Link>
      </div>

      {/* Onboarding banner — shown until store is connected */}
      {!hasConnectedStore && (
        <div className="flex items-start gap-4 bg-amber-50 border border-amber-200 rounded-2xl px-5 py-4">
          <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
            <AlertTriangle size={18} className="text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-900">Connect your store to get started</p>
            <p className="text-xs text-amber-700 mt-1">
              Before you can submit sourcing requests, connect your Shopify store.
              This lets FastFulfill automatically import your orders and fulfill them as stock arrives in our warehouse.
            </p>
          </div>
          <Link href="/dashboard/integrations" className="shrink-0">
            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white whitespace-nowrap">
              <Plug size={13} /> Connect Store
            </Button>
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Total Orders"
          value={stats.totalOrders}
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="In Transit"
          value={stats.inTransit}
          icon={<Truck size={18} />}
        />
        <StatCard
          label="Stores Connected"
          value={hasConnectedStore ? "Active" : "None"}
          icon={<Plug size={18} />}
        />
        <StatCard
          label="Pending Requests"
          value={stats.pendingRequests}
          icon={<Search size={18} />}
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
          <Link href="/dashboard/orders">
            <Button variant="ghost" size="sm">
              View all <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center">
            <ShoppingCart size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No orders yet.</p>
            {!hasConnectedStore && (
              <p className="text-xs text-gray-400 mt-1">
                <Link href="/dashboard/integrations" className="text-brand-600 hover:underline">Connect your store</Link> to start importing orders.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Product", "Qty", "Status", "Date", "Tracking"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{order.product_name}</td>
                    <td className="px-6 py-4 text-gray-600">{order.quantity}</td>
                    <td className="px-6 py-4">
                      <Badge className={ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] ?? "bg-gray-100 text-gray-600"}>
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {order.tracking_number ?? "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Sourcing Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Sourcing Requests</h2>
          <Link href="/dashboard/source">
            <Button variant="ghost" size="sm">
              View all <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        {recentRequests.length === 0 ? (
          <div className="py-12 text-center">
            <Search size={28} className="text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-gray-400">No sourcing requests yet.</p>
            {hasConnectedStore && (
              <Link href="/dashboard/source">
                <Button size="sm" className="mt-4">
                  <Search size={14} /> Submit your first request
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  {["Product", "Qty", "Country", "Status", "Quoted"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{req.product_name ?? "—"}</td>
                    <td className="px-6 py-4 text-gray-600">{req.quantity}</td>
                    <td className="px-6 py-4 text-gray-500">{req.target_country}</td>
                    <td className="px-6 py-4">
                      <Badge className={SOURCE_STATUS_COLORS[req.status as keyof typeof SOURCE_STATUS_COLORS] ?? "bg-gray-100 text-gray-600"}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {req.quoted_price ? `$${req.quoted_price}/unit` : "—"}
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
