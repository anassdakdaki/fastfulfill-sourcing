import { ShoppingCart, Truck, Search, ArrowRight, Plug, AlertTriangle, CheckCircle2 } from "lucide-react";
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Welcome back! Here&apos;s what&apos;s happening.</p>
        </div>
        <Link href="/dashboard/source">
          <Button size="sm">
            <Search size={15} />
            New Request
          </Button>
        </Link>
      </div>

      {/* Onboarding banner shown until store is connected */}
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

      <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 dark:text-white">First order checklist</h2>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Follow this path to go from signup to your first shipped order.
            </p>
          </div>
          <Link href={hasConnectedStore ? "/dashboard/source" : "/dashboard/integrations"}>
            <Button size="sm" variant="outline">
              Continue <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-5">
          {[
            { label: "Connect Shopify", done: hasConnectedStore, href: "/dashboard/integrations" },
            { label: "Submit first product", done: recentRequests.length > 0, href: "/dashboard/source" },
            { label: "Choose destination", done: recentRequests.length > 0, href: "/dashboard/source" },
            { label: "Request sample", done: false, href: "/dashboard/source" },
            { label: "View quote", done: stats.pendingRequests === 0 && recentRequests.length > 0, href: "/dashboard/quotes" },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-3 text-xs font-medium text-gray-600 transition-colors hover:border-brand-200 hover:bg-brand-50 dark:border-gray-800 dark:bg-gray-950 dark:text-gray-300 dark:hover:border-brand-900 dark:hover:bg-brand-950/30"
            >
              <CheckCircle2
                size={15}
                className={item.done ? "text-green-500" : "text-gray-300 dark:text-gray-600"}
              />
              {item.label}
            </Link>
          ))}
        </div>
      </div>

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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
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
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Product", "Qty", "Status", "Date", "Tracking"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{order.product_name}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{order.quantity}</td>
                    <td className="px-6 py-4">
                      <Badge className={ORDER_STATUS_COLORS[order.status as keyof typeof ORDER_STATUS_COLORS] ?? "bg-gray-100 text-gray-600"}>
                        {ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS] ?? order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-xs">
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
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Sourcing Requests</h2>
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
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  {["Product", "Qty", "Country", "Status", "Quoted"].map((h) => (
                    <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {recentRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{req.product_name ?? "Not set"}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{req.quantity}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{req.target_country}</td>
                    <td className="px-6 py-4">
                      <Badge className={SOURCE_STATUS_COLORS[req.status as keyof typeof SOURCE_STATUS_COLORS] ?? "bg-gray-100 text-gray-600"}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                          {req.quoted_price ? `$${req.quoted_price}/unit` : "Not set"}
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
