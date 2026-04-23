import { IntegrationUnavailable } from "@/components/dashboard/integration-unavailable";

export default function ShipStationIntegrationPage() {
  return (
    <IntegrationUnavailable
      name="ShipStation"
      description="ShipStation carrier automation is planned, but this connector is not enabled for production accounts yet."
    />
  );
}
