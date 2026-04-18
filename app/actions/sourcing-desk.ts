"use server";

import { createClient } from "@/lib/supabase/server";

export async function loadSourcingRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sourcing_requests")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function markRequestReviewing(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sourcing_requests")
    .update({ status: "reviewing" })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function declineRequest(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sourcing_requests")
    .update({ status: "declined" })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function sendQuoteToSeller(
  requestId: string,
  form: {
    ourCost: number;
    shipping: number;
    moq: number;
    leadTime: number;
    notes: string;
  }
) {
  const supabase = await createClient();

  // Get the sourcing request details
  const { data: req, error: reqErr } = await supabase
    .from("sourcing_requests")
    .select("ref, qty_requested, seller_ref, product_name")
    .eq("id", requestId)
    .single();

  if (reqErr || !req) return { error: reqErr?.message ?? "Request not found" };

  const DEFAULT_MARGIN = 20;
  const sellerUnit = parseFloat((form.ourCost * (1 + DEFAULT_MARGIN / 100)).toFixed(2));
  const sellerTotal = parseFloat((sellerUnit * req.qty_requested).toFixed(2));

  // Generate quote ref (FF-QTE-XXXX)
  const { data: lastQuote } = await supabase
    .from("sent_quotes")
    .select("ref")
    .order("sent_at", { ascending: false })
    .limit(1)
    .single();

  let nextNum = 1;
  if (lastQuote?.ref) {
    const n = parseInt(lastQuote.ref.replace("FF-QTE-", ""));
    if (!isNaN(n)) nextNum = n + 1;
  }
  const ref = "FF-QTE-" + String(nextNum).padStart(4, "0");
  const validUntil = new Date(Date.now() + 7 * 86_400_000).toISOString();

  const { error } = await supabase.from("sent_quotes").insert({
    request_id: requestId,
    ref,
    seller_ref: req.seller_ref,
    product_name: req.product_name,
    our_cost: form.ourCost,
    shipping_cost: form.shipping,
    margin_pct: DEFAULT_MARGIN,
    seller_unit_price: sellerUnit,
    seller_total: sellerTotal,
    moq: form.moq,
    qty: req.qty_requested,
    lead_time_days: form.leadTime,
    valid_until: validUntil,
    notes: form.notes || null,
    status: "awaiting",
  });

  if (error) return { error: error.message };

  // Update sourcing_request status to quoted
  await supabase
    .from("sourcing_requests")
    .update({ status: "quoted" })
    .eq("id", requestId);

  // Send email notification (fire-and-forget)
  try {
    const { data: sr } = await supabase
      .from("sourcing_requests")
      .select("user_id")
      .eq("id", requestId)
      .single();
    if (sr) {
      const { data: { user } } = await supabase.auth.admin.getUserById(sr.user_id);
      if (user?.email) {
        const { sendQuoteEmail } = await import("./email");
        await sendQuoteEmail(user.email, req.product_name, ref);
      }
    }
  } catch { /* email is non-critical */ }

  return { error: null };
}

export async function loadSupplierSidebarBadges() {
  const supabase = await createClient();
  const [{ count: pendingRequests }, { count: pendingQuotes }] = await Promise.all([
    supabase.from("sourcing_requests").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("sent_quotes").select("*", { count: "exact", head: true }).eq("status", "awaiting"),
  ]);
  return {
    pendingRequests: pendingRequests ?? 0,
    pendingQuotes:   pendingQuotes   ?? 0,
  };
}

export async function loadSentQuotes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("sent_quotes")
    .select("*")
    .order("sent_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function loadProcurement() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("procurement")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function advanceProcurementStatus(id: string, currentStatus: string) {
  const supabase = await createClient();

  const nextMap: Record<string, string> = {
    sourcing:   "ordered",
    ordered:    "in_transit",
    in_transit: "at_warehouse",
  };
  const next = nextMap[currentStatus];
  if (!next) return { error: "Already at final stage" };

  const update: Record<string, unknown> = { status: next };
  if (next === "ordered") update.ordered_at = new Date().toISOString();
  if (next === "ordered") update.eta = new Date(Date.now() + 14 * 86_400_000).toISOString();

  const { error } = await supabase
    .from("procurement")
    .update(update)
    .eq("id", id);

  return { error: error?.message ?? null };
}
