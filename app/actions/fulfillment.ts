"use server";

import { createClient } from "@/lib/supabase/server";

// ── Inbound Shipments ─────────────────────────────────────────────────────────

export async function loadInboundShipments() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inbound_shipments")
    .select("*")
    .order("expected_date", { ascending: true });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function confirmReceipt(id: string, quantityReceived: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inbound_shipments")
    .update({ status: "logged", quantity_received: quantityReceived })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateInboundStatus(id: string, status: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("inbound_shipments")
    .update({ status })
    .eq("id", id);
  return { error: error?.message ?? null };
}

// ── Warehouse Stock ───────────────────────────────────────────────────────────

export async function loadWarehouseStock() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("warehouse_stock")
    .select("*")
    .order("product_name", { ascending: true });
  return { data: data ?? [], error: error?.message ?? null };
}

// ── Fulfillment Queue ─────────────────────────────────────────────────────────

export async function loadFulfillmentQueue() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fulfillment_queue")
    .select("*")
    .order("received_at", { ascending: true });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function packOrder(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fulfillment_queue")
    .update({ status: "packed" })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function shipOrder(id: string, trackingNumber: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fulfillment_queue")
    .update({
      status: "shipped",
      tracking_number: trackingNumber,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function markDelivered(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("fulfillment_queue")
    .update({ status: "delivered" })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function bulkImportTracking(
  updates: { ref: string; tracking_number: string }[]
) {
  const supabase = await createClient();
  let updated = 0;

  for (const u of updates) {
    const { error } = await supabase
      .from("fulfillment_queue")
      .update({ tracking_number: u.tracking_number, status: "shipped", shipped_at: new Date().toISOString() })
      .eq("ref", u.ref)
      .eq("status", "packed");
    if (!error) updated++;
  }

  return { updated };
}
