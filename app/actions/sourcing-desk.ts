"use server";

import { createClient } from "@/lib/supabase/server";
import type { ProcurementItem, SentQuote, SourcingRequest } from "@/types/database";

function requestRef(id: string) {
  return `REQ-${id.slice(0, 8).toUpperCase()}`;
}

function sellerRef(id: string) {
  return `Seller ${id.slice(0, 6).toUpperCase()}`;
}

function quoteRef(id: string) {
  return `QTE-${id.slice(0, 8).toUpperCase()}`;
}

function mapRequest(row: {
  id: string;
  user_id: string;
  product_url: string;
  product_name: string | null;
  quantity: number;
  target_country: string;
  notes: string | null;
  status: string;
  created_at: string;
}): SourcingRequest {
  const statusMap: Record<string, SourcingRequest["status"]> = {
    pending: "new",
    reviewing: "reviewing",
    quoted: "quoted",
    approved: "accepted",
    rejected: "declined",
  };

  return {
    id: row.id,
    ref: requestRef(row.id),
    seller_ref: sellerRef(row.user_id),
    product_name: row.product_name ?? "Product request",
    product_url: row.product_url,
    category: "General",
    qty_requested: row.quantity,
    target_country: row.target_country,
    notes: row.notes,
    urgency: "normal",
    status: statusMap[row.status] ?? "new",
    created_at: row.created_at,
  };
}

function mapQuote(row: {
  id: string;
  source_request_id: string;
  buyer_id: string;
  product_name: string;
  unit_price: number;
  moq: number;
  quantity: number;
  lead_time_days: number;
  shipping_cost: number;
  total_cost: number;
  valid_until: string;
  notes: string | null;
  status: string;
  created_at: string;
}): SentQuote {
  const sellerUnit = Number(row.unit_price);
  const shipping = Number(row.shipping_cost);
  const total = Number(row.total_cost);
  const qty = Number(row.quantity);
  const estimatedUnitCost = qty > 0 ? Math.max(0, (total - shipping) / qty) : sellerUnit;
  const statusMap: Record<string, SentQuote["status"]> = {
    pending: "awaiting",
    accepted: "accepted",
    declined: "declined",
    expired: "expired",
  };

  return {
    id: row.id,
    request_id: row.source_request_id,
    ref: quoteRef(row.id),
    seller_ref: sellerRef(row.buyer_id),
    product_name: row.product_name,
    our_cost: estimatedUnitCost,
    shipping_cost: shipping,
    margin_pct: 0,
    seller_unit_price: sellerUnit,
    seller_total: total,
    moq: row.moq,
    qty,
    lead_time_days: row.lead_time_days,
    valid_until: row.valid_until,
    notes: row.notes,
    status: statusMap[row.status] ?? "awaiting",
    sent_at: row.created_at,
  };
}

export async function loadSourcingRequests() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("source_requests")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data ?? []).map(mapRequest), error: error?.message ?? null };
}

export async function markRequestReviewing(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("source_requests")
    .update({ status: "reviewing" })
    .eq("id", id);

  return { error: error?.message ?? null };
}

export async function declineRequest(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("source_requests")
    .update({ status: "rejected" })
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: request, error: requestError } = await supabase
    .from("source_requests")
    .select("id, user_id, product_name, quantity")
    .eq("id", requestId)
    .single();

  if (requestError || !request) {
    return { error: requestError?.message ?? "Request not found" };
  }

  const defaultMargin = 20;
  const sellerUnit = Number((form.ourCost * (1 + defaultMargin / 100)).toFixed(2));
  const sellerTotal = Number((sellerUnit * request.quantity + form.shipping).toFixed(2));
  const validUntil = new Date(Date.now() + 7 * 86_400_000).toISOString();

  const { error } = await supabase.from("quotes").insert({
    source_request_id: request.id,
    supplier_id: user.id,
    buyer_id: request.user_id,
    product_name: request.product_name ?? "Product request",
    unit_price: sellerUnit,
    moq: form.moq,
    quantity: request.quantity,
    lead_time_days: form.leadTime,
    shipping_cost: form.shipping,
    total_cost: sellerTotal,
    valid_until: validUntil,
    notes: form.notes || null,
    status: "pending",
  });

  if (error) return { error: error.message };

  await supabase
    .from("source_requests")
    .update({ status: "quoted", quoted_price: sellerUnit })
    .eq("id", requestId);

  return { error: null };
}

export async function loadSupplierSidebarBadges() {
  const supabase = await createClient();
  const [{ count: pendingRequests }, { count: pendingQuotes }] = await Promise.all([
    supabase.from("source_requests").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("quotes").select("*", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    pendingRequests: pendingRequests ?? 0,
    pendingQuotes: pendingQuotes ?? 0,
  };
}

export async function loadSentQuotes() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotes")
    .select("*")
    .order("created_at", { ascending: false });

  return { data: (data ?? []).map(mapQuote), error: error?.message ?? null };
}

export async function loadProcurement(): Promise<{ data: unknown[]; error: string | null }> {
  const empty: ProcurementItem[] = [];
  return { data: empty as unknown[], error: null };
}

export async function advanceProcurementStatus(...args: unknown[]) {
  void args;
  return { error: "Procurement pipeline is not enabled yet." };
}
