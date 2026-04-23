import { IntegrationUnavailable } from "@/components/dashboard/integration-unavailable";

export default function TikTokIntegrationPage() {
  return (
    <IntegrationUnavailable
      name="TikTok Shop"
      description="TikTok Shop order sync is planned, but this connector is not enabled for production accounts yet."
    />
  );
}
