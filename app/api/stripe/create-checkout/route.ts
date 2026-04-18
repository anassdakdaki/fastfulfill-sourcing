import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from "@/lib/supabase/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-03-31.basil" });

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { invoiceId } = await req.json();
  if (!invoiceId) return NextResponse.json({ error: "Missing invoiceId" }, { status: 400 });

  const { data: invoice, error } = await supabase
    .from("invoices")
    .select("*")
    .eq("id", invoiceId)
    .eq("user_id", user.id)
    .single();

  if (error || !invoice) return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
  if (invoice.status === "paid") return NextResponse.json({ error: "Already paid" }, { status: 400 });

  const totalCents = Math.round(Number(invoice.total) * 100);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: invoice.description,
            metadata: { invoice_number: invoice.invoice_number },
          },
          unit_amount: totalCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      invoice_id:  invoice.id,
      user_id:     user.id,
      invoice_num: invoice.invoice_number,
    },
    success_url: `${appUrl}/dashboard/invoices?paid=${invoice.id}`,
    cancel_url:  `${appUrl}/dashboard/invoices`,
  });

  // Store session id on invoice
  await supabase
    .from("invoices")
    .update({ stripe_session_id: session.id })
    .eq("id", invoice.id);

  return NextResponse.json({ url: session.url });
}
