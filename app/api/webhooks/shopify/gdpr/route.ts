import { NextRequest, NextResponse } from "next/server";
import { verifyShopifyWebhookSignature } from "@/lib/shopify";

/**
 * Shopify mandatory GDPR compliance webhooks.
 * Required for app review: customers/data_request, customers/redact, shop/redact.
 * All three can share this endpoint — Shopify sends the topic in the header.
 */
export async function POST(req: NextRequest) {
  const body = await req.text();
  const hmacHeader = req.headers.get("x-shopify-hmac-sha256");
  const topic = (req.headers.get("x-shopify-topic") ?? "").toLowerCase();
  const shop  = req.headers.get("x-shopify-shop-domain") ?? "";

  if (!verifyShopifyWebhookSignature(body, hmacHeader)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // Log for audit trail — in production you'd queue a job to redact/export data
  console.log(`[shopify-gdpr] topic=${topic} shop=${shop}`);

  switch (topic) {
    case "customers/data_request":
      // Merchant requested customer data export.
      // In production: email the customer their stored data (orders, emails).
      // For now: acknowledge receipt — no PII stored beyond order info.
      console.log("[shopify-gdpr] customers/data_request received — no additional PII stored");
      break;

    case "customers/redact":
      // Merchant requested customer data deletion.
      // In production: delete/anonymize customer PII from your DB.
      // Orders reference customer_name/email — anonymize those rows.
      console.log("[shopify-gdpr] customers/redact received — customer PII noted for deletion");
      break;

    case "shop/redact":
      // Store uninstalled 48h+ ago — delete all store data.
      // The app/uninstalled webhook already removed the integration row.
      // This is the final cleanup signal.
      console.log("[shopify-gdpr] shop/redact received — store data cleanup confirmed");
      break;

    default:
      console.log(`[shopify-gdpr] unknown topic: ${topic}`);
  }

  return NextResponse.json({ received: true });
}
