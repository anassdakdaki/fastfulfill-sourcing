import { NextRequest, NextResponse } from "next/server";
import {
  disconnectShopifyByDomain,
  loadShopifyIntegrationByDomain,
  normalizeShopDomain,
  refreshShopifyIntegrationStats,
  type ShopifyRestOrder,
  upsertShopifyOrder,
  verifyShopifyWebhookSignature,
} from "@/lib/shopify";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  const shopDomain = normalizeShopDomain(req.headers.get("x-shopify-shop-domain") ?? "");
  const topic = (req.headers.get("x-shopify-topic") ?? "").toLowerCase();

  if (!verifyShopifyWebhookSignature(body, hmacHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  if (!shopDomain) {
    return NextResponse.json({ received: true });
  }

  if (topic === "app/uninstalled") {
    await disconnectShopifyByDomain(shopDomain);
    return NextResponse.json({ received: true });
  }

  if (topic !== "orders/create") {
    return NextResponse.json({ received: true });
  }

  let shopifyOrder: Record<string, unknown>;
  try {
    shopifyOrder = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const integration = await loadShopifyIntegrationByDomain(shopDomain);
  if (!integration) {
    return NextResponse.json({ received: true });
  }

  try {
    await upsertShopifyOrder(integration, shopifyOrder as ShopifyRestOrder);
    await refreshShopifyIntegrationStats(integration.id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shopify webhook import failed";
    console.error("Shopify webhook import failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
