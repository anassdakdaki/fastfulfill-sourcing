import { IntegrationUnavailable } from "@/components/dashboard/integration-unavailable";

export default function DhlIntegrationPage() {
  return (
    <IntegrationUnavailable
      name="DHL eCommerce"
      description="DHL carrier automation is planned, but this connector is not enabled for production accounts yet."
    />
  );
}
