import { redirect } from "next/navigation";

// Orders page has moved to Procurement
export default function SupplierOrdersRedirect() {
  redirect("/supplier/procurement");
}
