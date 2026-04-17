import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trackingNumber = searchParams.get("tracking_number");
  const orderId = searchParams.get("order_id");

  if (!trackingNumber && !orderId) {
    return NextResponse.json(
      { error: "tracking_number or order_id is required" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  // Find order by tracking number or id (public endpoint - no auth required)
  let orderQuery = supabase.from("orders").select("id, product_name, quantity, status, tracking_number, destination_country");

  if (trackingNumber) {
    orderQuery = orderQuery.eq("tracking_number", trackingNumber);
  } else {
    orderQuery = orderQuery.eq("id", orderId!);
  }

  const { data: order, error: orderError } = await orderQuery.single();

  if (orderError || !order) {
    return NextResponse.json({ error: "Shipment not found" }, { status: 404 });
  }

  const { data: events, error: eventsError } = await supabase
    .from("tracking")
    .select("*")
    .eq("order_id", order.id)
    .order("timestamp", { ascending: false });

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 });
  }

  return NextResponse.json({ order, events: events ?? [] });
}
