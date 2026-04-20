import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  disconnectShopifyByDomainAdmin,
  loadShopifyIntegrationByDomainAdmin,
  mapShopifyOrderForWebhook,
  normalizeShopDomain,
  upsertShopifyOrderAdmin,
  verifyShopifyWebhookSignature,
  type ShopifyRestOrder,
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

  const supabase = await createClient();

  if (topic === "app/uninstalled") {
    const { error } = await supabase.rpc("fn_shopify_disconnect", { p_shop_domain: shopDomain });
    if (error) {
      try {
        await disconnectShopifyByDomainAdmin(shopDomain);
      } catch (adminError) {
        const message = adminError instanceof Error ? adminError.message : String(adminError);
        console.error("Shopify webhook: disconnect failed", error.message, message);
      }
    }
    return NextResponse.json({ received: true });
  }

  if (topic !== "orders/create") {
    return NextResponse.json({ received: true });
  }

  let shopifyOrder: ShopifyRestOrder;
  try {
    shopifyOrder = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { data: integrationRaw, error: lookupErr } = await supabase.rpc(
    "fn_shopify_lookup_integration",
    { p_shop_domain: shopDomain }
  );

  let integration = integrationRaw as {
    id: string;
    user_id: string;
    auto_fulfill: boolean;
    auto_import_orders: boolean;
    status: string;
  } | null;

  if (lookupErr || !integration) {
    try {
      integration = await loadShopifyIntegrationByDomainAdmin(shopDomain) as typeof integration;
    } catch (adminError) {
      const message = adminError instanceof Error ? adminError.message : String(adminError);
      console.error("Shopify webhook: integration lookup failed", lookupErr?.message, message);
      return NextResponse.json({ received: true });
    }
  }

  if (!integration) {
    return NextResponse.json({ received: true });
  }

  try {
    const mapped = mapShopifyOrderForWebhook(shopifyOrder);

    const { error: upsertErr } = await supabase.rpc("fn_shopify_upsert_order", {
      p_shop_domain: shopDomain,
      p_user_id: integration.user_id,
      p_integration_id: integration.id,
      p_external_id: String(shopifyOrder.id),
      p_external_name: shopifyOrder.name ?? null,
      p_product_name: mapped.productName,
      p_quantity: mapped.totalQuantity,
      p_unit_price: mapped.unitPrice ?? null,
      p_status: mapped.status,
      p_customer_name: mapped.customerName,
      p_customer_email: mapped.customerEmail,
      p_shipping_address: mapped.shippingAddress,
      p_line_items: mapped.lineItems,
      p_destination_country: mapped.destinationCountry,
    });

    if (upsertErr) {
      try {
        await upsertShopifyOrderAdmin(shopDomain, shopifyOrder);
      } catch (adminError) {
        const adminMessage = adminError instanceof Error ? adminError.message : String(adminError);
        console.error("Shopify webhook: order upsert failed", upsertErr.message, adminMessage);
        return NextResponse.json({ error: adminMessage }, { status: 500 });
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Shopify webhook import failed";
    console.error("Shopify webhook import failed", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
