import { redirect } from "next/navigation";

// Suppliers are managed internally by FastFulfill.
// Buyers never interact with supplier identities directly.
export default function SuppliersPage() {
  redirect("/dashboard");
}
