import { ShoppingCart, Truck, Archive, Search, ArrowRight } from "lucide-react";
import Link from "next/link";
import { StatCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DUMMY_ORDERS,
  DUMMY_INVENTORY,
  DUMMY_SOURCE_REQUESTS,
} from "@/lib/dummy-data";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_COLORS,
  SOURCE_STATUS_COLORS,
  formatDate,
} from "@/lib/utils";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default function DashboardPage() {
  const totalOrders = DUMMY_ORDERS.length;
  const shipped = DUMMY_ORDERS.filter((o) => o.status === "shipped").length;
  const totalInventory = DUMMY_INVENTORY.reduce((s, i) => s + i.quantity, 0);
  const pendingRequests = DUMMY_SOURCE_REQUESTS.filter((r) => r.status === "pending" || r.status === "reviewing").length;

  const recentOrders = DUMMY_ORDERS.slice(0, 5);

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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Total Orders"
          value={totalOrders}
          change="12% vs last month"
          positive
          icon={<ShoppingCart size={18} />}
        />
        <StatCard
          label="In Transit"
          value={shipped}
          change="5% vs last month"
          positive
          icon={<Truck size={18} />}
        />
        <StatCard
          label="Inventory Units"
          value={totalInventory.toLocaleString()}
          change="3% vs last month"
          positive={false}
          icon={<Archive size={18} />}
        />
        <StatCard
          label="Pending Requests"
          value={pendingRequests}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracking</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{order.product_name}</td>
                  <td className="px-6 py-4 text-gray-600">{order.quantity}</td>
                  <td className="px-6 py-4">
                    <Badge className={ORDER_STATUS_COLORS[order.status]}>
                      {ORDER_STATUS_LABELS[order.status]}
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
      </div>

      {/* Source Requests */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">Sourcing Requests</h2>
          <Link href="/dashboard/source">
            <Button variant="ghost" size="sm">
              View all <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Qty</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Country</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Quoted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {DUMMY_SOURCE_REQUESTS.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{req.product_name}</td>
                  <td className="px-6 py-4 text-gray-600">{req.quantity}</td>
                  <td className="px-6 py-4 text-gray-500">{req.target_country}</td>
                  <td className="px-6 py-4">
                    <Badge className={SOURCE_STATUS_COLORS[req.status]}>
                      {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-500">
                    {req.quoted_price ? `$${req.quoted_price}/unit` : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
