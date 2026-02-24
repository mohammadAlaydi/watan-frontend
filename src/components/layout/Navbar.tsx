"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import Logo from "@/components/shared/Logo";
import { NAV_LINKS } from "@/lib/constants";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "border-border bg-cream/90 shadow-sm backdrop-blur-xl"
          : "border-transparent bg-cream/80 backdrop-blur-xl"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" aria-label="Watan home">
          <Logo size="md" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted transition-colors hover:text-charcoal"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop auth buttons */}
        <div className="hidden items-center gap-3 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/sign-in" className="text-sm font-medium text-muted">
              Sign in
            </Link>
          </Button>
          <Button
            asChild
            className="rounded-xl bg-olive px-5 text-sm font-semibold text-white transition-all hover:bg-charcoal"
          >
            <Link href="/sign-up">Join Watan →</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="h-5 w-5 text-charcoal" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-cream">
              <SheetTitle className="sr-only">Navigation menu</SheetTitle>
              <div className="mt-8 flex flex-col gap-6">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium text-charcoal-mid transition-colors hover:text-charcoal"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-3 border-t border-border pt-6">
                  <Button variant="outline" asChild className="w-full rounded-xl">
                    <Link href="/sign-in">Sign in</Link>
                  </Button>
                  <Button
                    asChild
                    className="w-full rounded-xl bg-olive font-semibold text-white hover:bg-charcoal"
                  >
                    <Link href="/sign-up">Join Watan →</Link>
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
}
