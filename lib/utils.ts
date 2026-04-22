import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// ─── Platform margin ──────────────────────────────────────────────────────────
// Supplier submits cost price. Buyer always sees cost + this margin.
// This is never exposed to either party.
export const PLATFORM_MARGIN = 0.20; // 20%

export function applyMargin(cost: number): number {
  return Math.round(cost * (1 + PLATFORM_MARGIN) * 100) / 100;
}

export function removeMarge(buyerPrice: number): number {
  return Math.round((buyerPrice / (1 + PLATFORM_MARGIN)) * 100) / 100;
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatReadingTime(minutes: number): string {
  return `${Math.max(1, Math.round(minutes))} min read`;
}

export const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:    "Pending",
  processing: "Processing",
  fulfilled:  "Fulfilled",
  shipped:    "Shipped",
  delivered:  "Delivered",
  cancelled:  "Cancelled",
};

export const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  fulfilled:  "bg-indigo-100 text-indigo-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-green-100 text-green-800",
  cancelled:  "bg-red-100 text-red-800",
};

export const SOURCE_STATUS_COLORS: Record<string, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  reviewing: "bg-blue-100 text-blue-800",
  quoted:    "bg-indigo-100 text-indigo-800",
  approved:  "bg-green-100 text-green-800",
  rejected:  "bg-red-100 text-red-800",
};

export const FULFILLMENT_STATUS_COLORS: Record<string, string> = {
  draft:      "bg-gray-100 text-gray-700",
  processing: "bg-blue-100 text-blue-800",
  shipped:    "bg-purple-100 text-purple-800",
  delivered:  "bg-green-100 text-green-800",
};

export const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  draft:      "Draft",
  processing: "Processing",
  shipped:    "Shipped",
  delivered:  "Delivered",
};

export const QUOTE_STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-800",
  accepted: "bg-green-100 text-green-800",
  declined: "bg-red-100 text-red-800",
  expired:  "bg-gray-100 text-gray-600",
};

export const INVOICE_STATUS_COLORS: Record<string, string> = {
  draft:   "bg-gray-100 text-gray-700",
  issued:  "bg-blue-100 text-blue-800",
  paid:    "bg-green-100 text-green-800",
  overdue: "bg-red-100 text-red-800",
};

export const SHIPPING_METHOD_LABELS: Record<string, string> = {
  air:     "Air Freight",
  sea:     "Sea Freight",
  express: "Express (DHL/FedEx)",
};

export const DESTINATION_TYPE_LABELS: Record<string, string> = {
  amazon_fba: "Amazon FBA",
  customer:   "Direct to Customer",
  "3pl":      "3PL Warehouse",
};
