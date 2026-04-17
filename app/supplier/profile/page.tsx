import { redirect } from "next/navigation";

// Profile page has moved to Settings
export default function SupplierProfileRedirect() {
  redirect("/supplier/settings");
}
