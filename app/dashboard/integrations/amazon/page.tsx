import { IntegrationUnavailable } from "@/components/dashboard/integration-unavailable";

export default function AmazonIntegrationPage() {
  return (
    <IntegrationUnavailable
      name="Amazon Seller"
      description="Amazon fulfillment and marketplace sync are planned, but this connector is not enabled for production accounts yet."
    />
  );
}
