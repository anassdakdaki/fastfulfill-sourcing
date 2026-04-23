import { IntegrationUnavailable } from "@/components/dashboard/integration-unavailable";

export default function WooCommerceIntegrationPage() {
  return (
    <IntegrationUnavailable
      name="WooCommerce"
      description="WooCommerce order sync is planned, but this connector is not enabled for production accounts yet."
    />
  );
}
