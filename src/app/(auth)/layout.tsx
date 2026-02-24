"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/shared/Logo";
import { AUTH_QUOTES, AUTH_FLAGS } from "@/lib/onboarding/constants";
import { useMemo } from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSignIn = pathname?.includes("sign-in");

  const quote = useMemo(
    () => AUTH_QUOTES[Math.floor(Math.random() * AUTH_QUOTES.length)],
    []
  );

  const flags = useMemo(() => {
    const shuffled = [...AUTH_FLAGS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, []);

  return (
    <div className="flex min-h-screen">
      {/* ─── Left Panel ─── */}
      <div className="relative hidden w-[45%] flex-col justify-between overflow-hidden bg-olive p-10 lg:flex">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#1C1F1A_0%,#4A5C3A_70%)] opacity-50" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-olive-light/20 blur-[100px]" />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/">
            <Logo size="md" theme="dark" />
          </Link>
        </div>

        {/* Quote */}
        <div className="relative z-10">
          <p className="max-w-xs text-2xl font-light italic leading-relaxed text-white/80">
            &ldquo;{quote}&rdquo;
          </p>
        </div>

        {/* Social proof */}
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 text-lg">
            {flags.map((flag, i) => (
              <span key={i}>{flag}</span>
            ))}
          </div>
          <p className="text-sm text-white/50">
            12,000+ professionals from 48 countries
          </p>
        </div>
      </div>

      {/* ─── Right Panel ─── */}
      <div className="flex flex-1 flex-col bg-cream">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 lg:px-10">
          <div className="lg:hidden">
            <Link href="/">
              <Logo size="sm" />
            </Link>
          </div>
          <div className="ml-auto text-sm text-muted">
            {isSignIn ? (
              <>
                Don&apos;t have an account?{" "}
                <Link
                  href="/sign-up"
                  className="font-semibold text-olive hover:text-olive-light"
                >
                  Sign up
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link
                  href="/sign-in"
                  className="font-semibold text-olive hover:text-olive-light"
                >
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Content area */}
        <div className="flex flex-1 items-center justify-center px-6 py-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>
    </div>
  );
}
