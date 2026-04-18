"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadActiveShipments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("id, product_name, quantity, status, tracking_number, destination_country, created_at, updated_at")
    .not("tracking_number", "is", null)
    .in("status", ["shipped", "fulfilled", "processing"])
    .order("updated_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function searchTracking(query: string) {
  const supabase = await createClient();
  const q = query.trim();

  // Try match on tracking_number or id
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .or(`tracking_number.ilike.%${q}%,id.eq.${q.match(/^[0-9a-f-]{36}$/) ? q : "00000000-0000-0000-0000-000000000000"}`)
    .limit(1);

  if (error || !orders?.length) return { order: null, events: [] };

  const order = orders[0];
  const { data: events } = await supabase
    .from("tracking")
    .select("*")
    .eq("order_id", order.id)
    .order("timestamp", { ascending: false });

  return { order, events: events ?? [] };
}
