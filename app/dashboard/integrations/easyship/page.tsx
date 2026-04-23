import { IntegrationUnavailable } from "@/components/dashboard/integration-unavailable";

export default function EasyshipIntegrationPage() {
  return (
    <IntegrationUnavailable
      name="Easyship"
      description="Easyship shipping automation is planned, but this connector is not enabled for production accounts yet."
    />
  );
}
