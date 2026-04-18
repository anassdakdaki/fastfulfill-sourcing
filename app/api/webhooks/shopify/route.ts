import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@/lib/supabase/server";

const SHOPIFY_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET ?? "";

function verifyHmac(body: string, hmacHeader: string | null): boolean {
  if (!hmacHeader || !SHOPIFY_SECRET) return false;
  const digest = crypto
    .createHmac("sha256", SHOPIFY_SECRET)
    .update(body, "utf8")
    .digest("base64");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmacHeader));
}

export async function POST(req: NextRequest) {
  const body       = await req.text();
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  const shopDomain = req.headers.get("x-shopify-shop-domain") ?? "";
  const topic      = req.headers.get("x-shopify-topic") ?? "";

  if (!verifyHmac(body, hmacHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
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

  const supabase = await createClient();

  // Look up which user owns this store integration
  const { data: integration } = await supabase
    .from("store_integrations")
    .select("user_id, store_name")
    .ilike("store_url", `%${shopDomain}%`)
    .single();

  if (!integration) {
    return NextResponse.json({ error: "Store not found" }, { status: 404 });
  }

  // Extract order details
  const lineItem   = (shopifyOrder.line_items as Array<Record<string, unknown>>)?.[0];
  const shipping   = (shopifyOrder.shipping_address as Record<string, unknown>) ?? {};
  const customer   = shopifyOrder.customer as Record<string, unknown> ?? {};
  const billing    = shopifyOrder.billing_address as Record<string, unknown> ?? {};

  const customerName  = `${shipping.first_name ?? billing.first_name ?? ""} ${shipping.last_name ?? billing.last_name ?? ""}`.trim();
  const customerEmail = (customer.email as string) ?? (shopifyOrder.email as string) ?? "";
  const productName   = (lineItem?.title as string) ?? "Unknown Product";
  const quantity      = Number(lineItem?.quantity ?? 1);
  const unitPrice     = Number(lineItem?.price ?? 0);
  const country       = (shipping.country_code as string) ?? (billing.country_code as string) ?? "US";

  const shippingAddress = {
    name:     customerName,
    line1:    shipping.address1 ?? billing.address1 ?? "",
    line2:    shipping.address2 ?? billing.address2 ?? "",
    city:     shipping.city     ?? billing.city     ?? "",
    state:    shipping.province ?? billing.province ?? "",
    zip:      shipping.zip      ?? billing.zip      ?? "",
    country,
    phone:    shipping.phone    ?? billing.phone    ?? "",
  };

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      user_id:              integration.user_id,
      product_name:         productName,
      quantity,
      unit_price:           unitPrice,
      status:               "pending",
      destination_country:  country,
      customer_name:        customerName,
      customer_email:       customerEmail,
      shipping_address:     shippingAddress,
      tracking_number:      null,
    })
    .select()
    .single();

  if (error) {
    console.error("Shopify webhook: order insert failed", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, order_id: order.id });
}
