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
  const { data: fq } = await supabase
    .from("fulfillment_queue")
    .select("customer_email, product_name, order_id")
    .eq("id", id)
    .single();

  const { error } = await supabase
    .from("fulfillment_queue")
    .update({
      status: "shipped",
      tracking_number: trackingNumber,
      shipped_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (!error && fq?.order_id) {
    // Also update the parent order tracking number + status
    await supabase
      .from("orders")
      .update({ tracking_number: trackingNumber, status: "shipped" })
      .eq("id", fq.order_id);

    // Send email (fire-and-forget)
    try {
      if (fq.customer_email) {
        const { sendShipmentEmail } = await import("./email");
        await sendShipmentEmail(fq.customer_email, fq.product_name, trackingNumber);
      }
    } catch { /* non-critical */ }
  }

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

export async function loadFulfillmentSidebarBadges() {
  const supabase = await createClient();
  const [{ count: pendingInbound }, { count: pendingOrders }] = await Promise.all([
    supabase.from("inbound_shipments").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("fulfillment_queue").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  return {
    pendingInbound: pendingInbound ?? 0,
    pendingOrders:  pendingOrders  ?? 0,
  };
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
