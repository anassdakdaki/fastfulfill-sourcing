import { redirect } from "next/navigation";

export default function SupplierSignupRedirectPage() {
  redirect("/auth/login");
}
