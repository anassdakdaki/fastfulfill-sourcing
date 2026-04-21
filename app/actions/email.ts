"use server";

import { Resend } from "resend";

const FROM = "FastFulfill <noreply@fastfulfill.com>";

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendQuoteEmail(to: string, productName: string, quoteRef: string) {
  const resend = getResend();
  if (!resend) return; // silently skip if not configured
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your quote is ready for ${productName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <div style="background:#f0f4ff;border-radius:12px;padding:24px;margin-bottom:24px">
          <h2 style="margin:0 0 8px;color:#1e293b;font-size:20px">Quote ready for ${productName}</h2>
          <p style="margin:0;color:#64748b;font-size:14px">Ref: <strong>${quoteRef}</strong></p>
        </div>
        <p style="color:#334155;font-size:15px;line-height:1.6">
          FastFulfill has prepared a sourcing quote for your request.
          Log in to your dashboard to review the pricing and accept or decline.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.fastfulfill.com"}/dashboard/quotes"
           style="display:inline-block;margin-top:20px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View Quote →
        </a>
        <p style="margin-top:32px;font-size:12px;color:#94a3b8">
          FastFulfill · You received this because you submitted a sourcing request.
        </p>
      </div>
    `,
  });
}

export async function sendShipmentEmail(to: string, productName: string, trackingNumber: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Your order has shipped for ${productName}`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <div style="background:#f0fdf4;border-radius:12px;padding:24px;margin-bottom:24px">
          <h2 style="margin:0 0 8px;color:#15803d;font-size:20px">📦 Your order is on its way!</h2>
          <p style="margin:0;color:#64748b;font-size:14px">${productName}</p>
        </div>
        <p style="color:#334155;font-size:15px;line-height:1.6">
          Your order has been shipped. Track it using the number below.
        </p>
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;font-size:12px;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em">Tracking Number</p>
          <p style="margin:4px 0 0;font-size:18px;font-weight:700;font-family:monospace;color:#1e293b">${trackingNumber}</p>
        </div>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.fastfulfill.com"}/dashboard/tracking"
           style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          Track Shipment →
        </a>
      </div>
    `,
  });
}

export async function sendInvoiceEmail(to: string, invoiceNumber: string, total: number, dueDate: string) {
  const resend = getResend();
  if (!resend) return;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `Invoice ${invoiceNumber} for $${total.toFixed(2)} due`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
        <div style="background:#fef3c7;border-radius:12px;padding:24px;margin-bottom:24px">
          <h2 style="margin:0 0 8px;color:#92400e;font-size:20px">Invoice ${invoiceNumber}</h2>
          <p style="margin:0;color:#78350f;font-size:14px">Amount due: <strong>$${total.toFixed(2)}</strong> by ${dueDate}</p>
        </div>
        <p style="color:#334155;font-size:15px;line-height:1.6">
          Your invoice has been generated. Please review and pay by the due date to avoid delays.
        </p>
        <a href="${process.env.NEXT_PUBLIC_APP_URL ?? "https://app.fastfulfill.com"}/dashboard/invoices"
           style="display:inline-block;margin-top:16px;padding:12px 24px;background:#6366f1;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px">
          View & Pay Invoice →
        </a>
      </div>
    `,
  });
}
