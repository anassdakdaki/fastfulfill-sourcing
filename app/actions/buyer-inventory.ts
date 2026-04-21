"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadMyInventory() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: [], error: "Not authenticated" };

  // Get all orders this buyer has placed and group by product to build inventory view
  const { data: orders, error } = await supabase
    .from("orders")
    .select("product_name, quantity, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return { data: [], error: error.message };

  // Aggregate by product name
  const map: Record<string, {
    product_name: string;
    total_ordered: number;
    pending: number;
    shipped: number;
    delivered: number;
    last_order: string;
  }> = {};

  for (const o of (orders ?? [])) {
    if (!map[o.product_name]) {
      map[o.product_name] = {
        product_name: o.product_name,
        total_ordered: 0, pending: 0, shipped: 0, delivered: 0,
        last_order: o.created_at,
      };
    }
    map[o.product_name].total_ordered += o.quantity;
    if (o.status === "pending")   map[o.product_name].pending   += o.quantity;
    if (o.status === "shipped")   map[o.product_name].shipped   += o.quantity;
    if (o.status === "delivered") map[o.product_name].delivered += o.quantity;
    if (o.created_at > map[o.product_name].last_order) {
      map[o.product_name].last_order = o.created_at;
    }
  }

  return { data: Object.values(map), error: null };
}

export async function loadWarehouseStockForBuyer() {
  const supabase = await createClient();
  // warehouse_stock rows linked to this user
  const { data, error } = await supabase
    .from("warehouse_stock")
    .select("*")
    .order("product_name", { ascending: true });
  return { data: data ?? [], error: error?.message ?? null };
}
