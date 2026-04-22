import Link from "next/link";
import { Package2 } from "lucide-react";

const FOOTER_LINKS = {
  Platform: [
    { href: "/catalog", label: "Product Catalog" },
    { href: "/services", label: "Services" },
    { href: "/pricing", label: "Pricing" },
    { href: "/tracking", label: "Track Order" },
  ],
  Company: [
    { href: "/blog", label: "Blog" },
    { href: "/contact", label: "Contact" },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy Policy" },
    { href: "/terms", label: "Terms of Service" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400">
      <div className="container-section py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-white text-lg mb-3">
              <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
                <Package2 size={18} className="text-white" />
              </div>
              FastFulfill
            </Link>
            <p className="text-sm leading-relaxed">
            Source products from China and fulfill orders worldwide faster and cheaper than ever.
            </p>
            <p className="text-xs mt-4 text-slate-600">Copyright {new Date().getFullYear()} FastFulfill. All rights reserved.</p>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="text-sm font-semibold text-white mb-4">{section}</p>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm hover:text-white transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
