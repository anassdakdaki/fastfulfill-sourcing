import { IntegrationUnavailable } from "@/components/dashboard/integration-unavailable";

export default function ShipBobIntegrationPage() {
  return (
    <IntegrationUnavailable
      name="ShipBob"
      description="External fulfillment partner routing is removed from launch scope and is not enabled for production accounts yet."
    />
  );
}
