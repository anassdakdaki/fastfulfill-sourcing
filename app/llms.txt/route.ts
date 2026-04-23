const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fastfulfill.com";

const CONTENT = `# FastFulfill

FastFulfill helps online sellers source products from China, store inventory, pack orders, and ship with tracking from one workflow.

## Public Pages
- Home: ${SITE_URL}/
- Services: ${SITE_URL}/services
- Pricing: ${SITE_URL}/pricing
- Catalog: ${SITE_URL}/catalog
- Tracking: ${SITE_URL}/tracking
- Blog: ${SITE_URL}/blog
- Contact: ${SITE_URL}/contact

## Key Topics
- Shopify fulfillment from China
- Product sourcing from China
- Shenzhen warehouse storage
- Ecommerce order packing and shipping
- Tracking updates for customer deliveries

## Private Areas
The following areas are private and should not be treated as public product documentation:
- ${SITE_URL}/dashboard
- ${SITE_URL}/supplier
- ${SITE_URL}/fulfillment

## Contact
- support@fastfulfill.com
`;

export function GET() {
  return new Response(CONTENT, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
