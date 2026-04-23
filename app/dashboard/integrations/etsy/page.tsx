import { IntegrationUnavailable } from "@/components/dashboard/integration-unavailable";

export default function EtsyIntegrationPage() {
  return (
    <IntegrationUnavailable
      name="Etsy"
      description="Etsy order sync is planned, but this connector is not enabled for production accounts yet."
    />
  );
}
