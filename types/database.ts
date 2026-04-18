export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      orders: {
        Row: OrderRow;
        Insert: OrderInsert;
        Update: Partial<OrderInsert>;
      };
      tracking: {
        Row: TrackingRow;
        Insert: TrackingInsert;
        Update: Partial<TrackingInsert>;
      };
      inventory: {
        Row: InventoryRow;
        Insert: InventoryInsert;
        Update: Partial<InventoryInsert>;
      };
      source_requests: {
        Row: SourceRequestRow;
        Insert: SourceRequestInsert;
        Update: Partial<SourceRequestInsert>;
      };
    };
  };
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export interface OrderRow {
  id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  status: "pending" | "processing" | "fulfilled" | "shipped" | "delivered" | "cancelled";
  tracking_number: string | null;
  destination_country: string | null;
  unit_price: number | null;
  source_platform?: string | null;
  source_store_domain?: string | null;
  external_order_id?: string | null;
  external_order_name?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  shipping_address?: Json | null;
  line_items?: Json[];
  created_at: string;
  updated_at: string;
}

export interface OrderInsert {
  user_id: string;
  product_name: string;
  quantity: number;
  status?: "pending" | "processing" | "fulfilled" | "shipped" | "delivered" | "cancelled";
  tracking_number?: string | null;
  destination_country?: string | null;
  unit_price?: number | null;
  source_platform?: string | null;
  source_store_domain?: string | null;
  external_order_id?: string | null;
  external_order_name?: string | null;
  customer_name?: string | null;
  customer_email?: string | null;
  shipping_address?: Json | null;
  line_items?: Json[];
}

// ─── Tracking ─────────────────────────────────────────────────────────────────

export interface TrackingRow {
  id: string;
  order_id: string;
  status: string;
  location: string | null;
  description: string | null;
  timestamp: string;
}

export interface TrackingInsert {
  order_id: string;
  status: string;
  location?: string | null;
  description?: string | null;
  timestamp?: string;
}

// ─── Inventory ────────────────────────────────────────────────────────────────

export interface InventoryRow {
  id: string;
  user_id: string;
  product_name: string;
  sku: string | null;
  quantity: number;
  warehouse_location: string | null;
  created_at: string;
  updated_at: string;
}

export interface InventoryInsert {
  user_id: string;
  product_name: string;
  sku?: string | null;
  quantity?: number;
  warehouse_location?: string | null;
}

// ─── Source Requests ──────────────────────────────────────────────────────────

export interface SourceRequestRow {
  id: string;
  user_id: string;
  product_url: string;
  product_name: string | null;
  quantity: number;
  target_country: string;
  notes: string | null;
  status: "pending" | "reviewing" | "quoted" | "approved" | "rejected";
  quoted_price: number | null;
  created_at: string;
  updated_at: string;
}

export interface SourceRequestInsert {
  user_id: string;
  product_url: string;
  product_name?: string | null;
  quantity: number;
  target_country: string;
  notes?: string | null;
  status?: "pending" | "reviewing" | "quoted" | "approved" | "rejected";
  quoted_price?: number | null;
}

// ─── Fulfillment ──────────────────────────────────────────────────────────────

export interface FulfillmentOrder {
  id: string;
  user_id: string;
  items: { product_name: string; sku: string | null; quantity: number }[];
  destination_type: "amazon_fba" | "customer" | "3pl";
  destination_address: string;
  shipping_method: "air" | "sea" | "express";
  status: "draft" | "processing" | "shipped" | "delivered";
  estimated_cost: number | null;
  estimated_delivery: string | null;
  tracking_number: string | null;
  created_at: string;
  updated_at: string;
}

// ─── Quotes ───────────────────────────────────────────────────────────────────

export interface Quote {
  id: string;
  user_id: string;
  source_request_id: string;
  product_name: string;
  supplier_name: string;
  unit_price: number;
  moq: number;
  quantity: number;
  lead_time_days: number;
  shipping_cost: number;
  total_cost: number;
  valid_until: string;
  notes: string | null;
  status: "pending" | "accepted" | "declined" | "expired";
  created_at: string;
}

// ─── Suppliers ────────────────────────────────────────────────────────────────

export interface Supplier {
  id: string;
  name: string;
  country: string;
  categories: string[];
  rating: number;
  total_orders: number;
  contact_name: string | null;
  contact_email: string | null;
  wechat: string | null;
  whatsapp: string | null;
  verified: boolean;
  notes: string | null;
  created_at: string;
}

// ─── Invoices ─────────────────────────────────────────────────────────────────

export interface Invoice {
  id: string;
  user_id: string;
  order_id?: string | null;
  quote_id?: string | null;
  invoice_number: string;
  description: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  status: "draft" | "issued" | "paid" | "overdue";
  issued_at: string;
  due_at: string;
  paid_at?: string | null;
  stripe_session_id?: string | null;
  stripe_payment_intent?: string | null;
}

// ─── Profiles ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  role: "buyer" | "supplier" | "fulfillment";
  full_name: string | null;
  company_name: string | null;
  country: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupplierProfile {
  id: string;
  categories: string[];
  rating: number;
  total_orders: number;
  wechat: string | null;
  whatsapp: string | null;
  website: string | null;
  bio: string | null;
  verified: boolean;
  pending_approval: boolean;
  created_at: string;
  updated_at: string;
}

// Full supplier (profile + supplier_profile joined)
export interface FullSupplier extends Profile, Omit<SupplierProfile, "id" | "created_at" | "updated_at"> {}

// ─── Store Integrations ───────────────────────────────────────────────────────

export type IntegrationPlatform = "shopify" | "woocommerce" | "amazon" | "tiktok" | "etsy";
export type IntegrationStatus = "connected" | "disconnected" | "syncing" | "error";

export interface StoreIntegration {
  id: string;
  user_id: string;
  platform: IntegrationPlatform;
  store_name: string;
  store_url: string;
  store_domain?: string | null;
  status: IntegrationStatus;
  auto_fulfill: boolean;
  auto_import_orders: boolean;
  orders_synced: number;
  products_mapped: number;
  last_sync: string | null;
  connected_at: string;
  error_message: string | null;
}

export interface ApiKey {
  id: string;
  user_id: string;
  label: string;
  key_preview: string; // e.g. "ff_live_••••••••3f9a"
  full_key: string;    // only shown once at creation
  last_used: string | null;
  created_at: string;
}

export interface Webhook {
  id: string;
  user_id: string;
  url: string;
  events: string[];
  status: "active" | "inactive";
  last_triggered: string | null;
  created_at: string;
}

// ─── Fulfillment Portal ───────────────────────────────────────────────────────

export type InboundStatus = "pending" | "in_transit" | "arrived" | "logged";

export interface InboundShipment {
  id: string;
  ref: string;              // FF-IB-0001
  product_name: string;
  sku: string;
  quantity_expected: number;
  quantity_received: number | null;
  status: InboundStatus;
  expected_date: string;
  notes: string | null;
  created_at: string;
}

export type WarehouseStockStatus = "ok" | "low" | "out";

export interface WarehouseStock {
  id: string;
  sku: string;
  product_name: string;
  in_stock: number;
  reserved: number;          // allocated to pending orders
  last_movement: string;
}

export type FulfillmentQueueStatus = "pending" | "packed" | "shipped" | "delivered";

export interface FulfillmentQueueOrder {
  id: string;
  ref: string;               // FF-ORD-00001
  order_id?: string | null;
  product_name: string;
  sku: string;
  quantity: number;
  ship_to_country: string;
  customer_name?: string | null;
  customer_email?: string | null;
  shipping_address?: Json | null;
  status: FulfillmentQueueStatus;
  tracking_number: string | null;
  received_at: string;
  shipped_at: string | null;
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string;
  user_id: string;
  type: "quote_received" | "quote_accepted" | "quote_declined" | "order_update" | "invoice_due" | "new_request";
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  created_at: string;
}

// ─── Sourcing Desk (Internal — FastFulfill Ops Team) ─────────────────────────

export type SourcingRequestStatus = "new" | "reviewing" | "quoted" | "accepted" | "declined";
export type SourcingUrgency       = "normal" | "high" | "rush";

export interface SourcingRequest {
  id: string;
  ref: string;              // FF-REQ-0001
  seller_ref: string;       // "Seller #4821" — never their real identity
  product_name: string;
  product_url: string | null;
  category: string;
  qty_requested: number;
  target_country: string;
  notes: string | null;
  urgency: SourcingUrgency;
  status: SourcingRequestStatus;
  created_at: string;
}

export type SentQuoteStatus = "awaiting" | "accepted" | "declined" | "expired";

export interface SentQuote {
  id: string;
  request_id: string;
  ref: string;              // FF-QTE-0001
  seller_ref: string;
  product_name: string;
  our_cost: number;         // what we pay supplier — INTERNAL, never shown to seller
  shipping_cost: number;    // internal
  margin_pct: number;       // e.g. 20
  seller_unit_price: number; // what seller sees: our_cost * (1 + margin/100)
  seller_total: number;     // seller_unit_price * qty
  moq: number;
  qty: number;
  lead_time_days: number;
  valid_until: string;
  notes: string | null;
  status: SentQuoteStatus;
  sent_at: string;
}

export type ProcurementStatus = "sourcing" | "ordered" | "in_transit" | "at_warehouse";

export interface ProcurementItem {
  id: string;
  quote_id: string;
  ref: string;              // FF-PRC-0001
  seller_ref: string;
  product_name: string;
  sku: string;
  qty: number;
  supplier_name: string;    // INTERNAL — never shown to seller
  supplier_cost: number;    // INTERNAL
  status: ProcurementStatus;
  eta: string | null;
  ordered_at: string | null;
  notes: string | null;
  created_at: string;
}

// ─── Convenience aliases ──────────────────────────────────────────────────────

export type Order = OrderRow;
export type TrackingEvent = TrackingRow;
export type InventoryItem = InventoryRow;
export type SourceRequest = SourceRequestRow;

export type OrderStatus = Order["status"];
export type SourceRequestStatus = SourceRequest["status"];
export type FulfillmentStatus = FulfillmentOrder["status"];
export type QuoteStatus = Quote["status"];
export type InvoiceStatus = Invoice["status"];
