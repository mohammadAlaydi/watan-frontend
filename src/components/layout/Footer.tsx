import Link from "next/link";
import Logo from "@/components/shared/Logo";

const FOOTER_LINKS = [
  { label: "About", href: "/about" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Community Guidelines", href: "/guidelines" },
  { label: "Contact", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-charcoal px-6 py-12 lg:px-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-8 sm:flex-row sm:justify-between">
        {/* Logo */}
        <Logo size="sm" theme="dark" />

        {/* Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/40 transition-colors hover:text-white/80"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <p className="text-xs text-white/25">
          © {new Date().getFullYear()} Watan
        </p>
      </div>
    </footer>
  );
}
