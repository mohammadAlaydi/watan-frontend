"use client";

import AnimatedCounter from "@/components/shared/AnimatedCounter";
import { STATS } from "@/lib/constants";

export default function StatsBand() {
  return (
    <section className="w-full bg-olive py-10">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-8 px-6 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`flex flex-col items-center text-center ${
              i < STATS.length - 1 ? "md:border-r md:border-white/10" : ""
            }`}
          >
            <p className="text-4xl font-extrabold tracking-tight text-white">
              <AnimatedCounter
                end={stat.value}
                suffix={stat.suffix}
                duration={2.5}
              />
            </p>
            <p className="mt-1 text-sm text-white/60">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
