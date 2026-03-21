"use client";

import { memo, useRef } from "react";
import { Icon } from "@iconify/react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ORBIT_RADIUS = 142;

const ORBIT_CARDS = [
  {
    icon: "solar:hand-stars-linear",
    label: "Daily swipes",
    value: "2,847",
    detail: "+12.3% this week",
    angle: -90,
  },
  {
    icon: "solar:users-group-rounded-linear",
    label: "Matches",
    value: "436",
    detail: "This month",
    angle: 30,
  },
  {
    icon: "solar:wallet-linear",
    label: "Invoiced",
    value: "Rp 47.2M",
    detail: "Via Mayar",
    angle: 150,
  },
] as const;

function getOrbitPosition(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: Math.cos(rad) * ORBIT_RADIUS, y: Math.sin(rad) * ORBIT_RADIUS };
}

export const LandingStatOrbit = memo(function LandingStatOrbit() {
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray<HTMLElement>(".orbit-card");
      const ring = containerRef.current?.querySelector(".orbit-ring");
      const glow = containerRef.current?.querySelector(".orbit-glow");

      // Entrance: cards scale up from center with stagger
      gsap.set(cards, { opacity: 0, scale: 0.7 });
      if (ring) gsap.set(ring, { opacity: 0, scale: 0.85 });
      if (glow) gsap.set(glow, { opacity: 0 });

      const tl = gsap.timeline({ delay: 0.6 });

      if (glow) tl.to(glow, { opacity: 1, duration: 0.8, ease: "power2.out" }, 0);
      if (ring) tl.to(ring, { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 0.1);

      tl.to(
        cards,
        {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.12,
        },
        0.25
      );

      // Gentle continuous orbit — slow, smooth, professional
      gsap.to(orbitRef.current, {
        rotation: 360,
        duration: 40,
        ease: "none",
        repeat: -1,
      });

      // Counter-rotate cards to stay upright
      cards.forEach((card) => {
        gsap.to(card, {
          rotation: -360,
          duration: 40,
          ease: "none",
          repeat: -1,
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <div ref={containerRef} className="relative mx-auto h-[400px] w-[460px]">
      {/* Background shape */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[278px] w-[344px] -translate-x-1/2 -translate-y-1/2 rounded-[44px] border border-border/80 bg-gradient-to-br from-surface/95 via-surface/72 to-accent-light/30 shadow-[0_28px_80px_-48px_rgba(27,31,28,0.42)]"
        aria-hidden="true"
      />

      {/* Orbit ring */}
      <div
        className="orbit-ring pointer-events-none absolute left-1/2 top-1/2 h-[236px] w-[236px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent/20"
        aria-hidden="true"
      />

      {/* Center glow */}
      <div
        className="orbit-glow pointer-events-none absolute left-1/2 top-1/2 h-24 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/12 blur-2xl"
        aria-hidden="true"
      />

      {/* Orbiting cards */}
      <div ref={orbitRef} className="absolute inset-0 will-change-transform">
        {ORBIT_CARDS.map((card) => {
          const pos = getOrbitPosition(card.angle);
          return (
            <div
              key={card.label}
              className="orbit-card absolute left-1/2 top-1/2 will-change-transform"
              style={{
                left: `calc(50% + ${pos.x}px)`,
                top: `calc(50% + ${pos.y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <div className="w-[216px] rounded-2xl border border-border bg-surface/95 p-5 shadow-[0_22px_44px_-28px_rgba(27,31,28,0.45)] backdrop-blur-sm">
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-light">
                    <Icon
                      icon={card.icon}
                      width={18}
                      height={18}
                      className="text-accent"
                    />
                  </div>
                  <p className="text-xs font-medium text-text-muted">{card.label}</p>
                </div>
                <p className="text-2xl font-bold tracking-tight text-text-primary">
                  {card.value}
                </p>
                <p className="mt-1 text-[11px] font-medium text-accent">{card.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
