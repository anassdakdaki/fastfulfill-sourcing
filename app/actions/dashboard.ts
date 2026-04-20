"use server";

import { createClient } from "@/lib/supabase/server";
import {
  markShopifyIntegrationError,
  normalizeShopDomain,
  resolveShopifyInstallUrl,
  syncShopifyOrders,
  validateShopifyConfiguration,
  verifyShopifyDbSetup,
} from "@/lib/shopify";
import type { IntegrationPlatform } from "@/types/database";

// ── Dashboard overview ────────────────────────────────────────────────────────

export async function loadDashboardOverview() {
  const supabase = await createClient();

  const [ordersRes, sourceRes, storeRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, product_name, quantity, status, tracking_number, unit_price, created_at, destination_country")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("source_requests")
      .select("id, product_name, quantity, target_country, status, quoted_price, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("store_integrations")
      .select("id")
      .eq("status", "connected")
      .limit(1),
  ]);

  return {
    recentOrders:      ordersRes.data    ?? [],
    recentRequests:    sourceRes.data    ?? [],
    hasConnectedStore: (storeRes.data?.length ?? 0) > 0,
  };
}

export async function loadDashboardStats() {
  const supabase = await createClient();

  const [totalOrdersRes, shippedRes, storeRes, pendingReqRes] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact", head: true }),
    supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["shipped", "fulfilled"]),
    supabase.from("store_integrations").select("id").eq("status", "connected").limit(1),
    supabase.from("source_requests").select("id", { count: "exact", head: true }).in("status", ["pending", "reviewing"]),
  ]);

  return {
    totalOrders:       totalOrdersRes.count  ?? 0,
    inTransit:         shippedRes.count       ?? 0,
    hasConnectedStore: (storeRes.data?.length ?? 0) > 0,
    pendingRequests:   pendingReqRes.count    ?? 0,
  };
}

// ── Orders ────────────────────────────────────────────────────────────────────

export async function loadMyOrders() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

// ── Store Integrations ────────────────────────────────────────────────────────

export async function loadMyIntegrations() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("store_integrations")
    .select("id, user_id, platform, store_name, store_url, store_domain, status, auto_fulfill, auto_import_orders, orders_synced, products_mapped, last_sync, connected_at, error_message")
    .order("connected_at", { ascending: false });
  return { data: data ?? [], error: error?.message ?? null };
}

export async function checkStoreConnected() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("store_integrations")
    .select("id")
    .eq("status", "connected")
    .limit(1);
  return { connected: (data?.length ?? 0) > 0 };
}

export async function connectStore(input: {
  platform: IntegrationPlatform;
  store_name?: string;
  store_url?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (input.platform !== "shopify") {
    return { error: "Only Shopify is wired live right now. Use the Shopify connector for real order sync." };
  }

  const config = validateShopifyConfiguration();
  if (!config.ok) {
    return { error: config.error ?? "Shopify app configuration is not ready" };
  }

  const setup = await verifyShopifyDbSetup(supabase);
  if (!setup.ok) {
    return { error: setup.error ?? "Shopify integration schema is not ready" };
  }

  const installUrl = resolveShopifyInstallUrl();
  if (installUrl) {
    return { error: null, redirectTo: installUrl };
  }

  const shopDomain = normalizeShopDomain(input.store_url ?? "");
  if (!shopDomain) {
    return { error: "Enter a valid Shopify domain like mystore.myshopify.com" };
  }

  const storeName = input.store_name?.trim() || shopDomain;
  const params = new URLSearchParams({
    shop: shopDomain,
    store_name: storeName,
  });

  return { error: null, redirectTo: `/api/integrations/shopify/install?${params.toString()}` };
}

export async function loadShopifyConnectSetup() {
  const installUrl = resolveShopifyInstallUrl();
  return {
    mode: installUrl ? "one_click" : "manual",
    installUrlConfigured: Boolean(installUrl),
  } as const;
}

export async function disconnectStore(id: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("store_integrations")
    .delete()
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function syncStore(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: integration, error: lookupError } = await supabase
    .from("store_integrations")
    .select("id, platform")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (lookupError || !integration) {
    return { error: "Store integration not found" };
  }

  if (integration.platform !== "shopify") {
    return { error: "Manual sync is only available on the live Shopify integration right now" };
  }

  const { error } = await supabase
    .from("store_integrations")
    .update({
      status: "syncing",
      error_message: null,
    })
    .eq("id", id);

  if (error) {
    return { error: error.message };
  }

  try {
    const result = await syncShopifyOrders(supabase, id);
    return { error: null, importedOrders: result.importedOrders };
  } catch (syncError) {
    const message = syncError instanceof Error ? syncError.message : "Shopify sync failed";
    await markShopifyIntegrationError(supabase, id, message);
    return { error: message };
  }
}

export async function toggleAutoFulfill(id: string, value: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("store_integrations")
    .update({ auto_fulfill: value })
    .eq("id", id);
  return { error: error?.message ?? null };
}

// ── Sidebar badge counts ──────────────────────────────────────────────────────

export async function loadSidebarBadges() {
  const supabase = await createClient();

  const [quotesRes, storeRes] = await Promise.all([
    supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase
      .from("store_integrations")
      .select("id")
      .eq("status", "connected")
      .limit(1),
  ]);

  return {
    pendingQuotes:     quotesRes.count ?? 0,
    hasConnectedStore: (storeRes.data?.length ?? 0) > 0,
  };
}
