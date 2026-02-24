"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CTASection() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="relative overflow-hidden bg-charcoal px-6 py-24 text-center lg:px-12">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-olive/30 blur-[180px]" />
      </div>

      <div className="relative z-10 mx-auto max-w-xl">
        <h2 className="mb-4 text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Your career. Your{" "}
          <span className="text-gold-light">community</span>.
        </h2>
        <p className="mb-8 text-lg text-white/60">
          Join thousands of Palestinian professionals building visibility,
          trust, and opportunity together.
        </p>

        {submitted ? (
          <div className="mx-auto max-w-sm rounded-xl border border-gold/20 bg-gold/10 p-6">
            <p className="text-base font-semibold text-gold-light">
              🎉 You&apos;re on the list!
            </p>
            <p className="mt-1 text-sm text-white/50">
              We&apos;ll reach out when Watan is ready for you.
            </p>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mx-auto flex max-w-sm gap-3"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 rounded-xl border-white/[0.12] bg-white/[0.08] px-4 py-3 text-white placeholder:text-white/35 focus:border-gold focus-visible:ring-0"
            />
            <Button
              type="submit"
              className="h-12 rounded-xl bg-gold px-6 py-3 font-bold text-charcoal transition-all hover:-translate-y-0.5 hover:bg-gold-light"
            >
              Join
            </Button>
          </form>
        )}

        <p className="mt-4 text-xs text-white/35">
          No spam. No credit card. Just your professional home.
        </p>
      </div>
    </section>
  );
}
