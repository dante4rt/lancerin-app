"use client";

import { memo, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import {
  animate,
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "framer-motion";

const BASE_ORBIT_SPEED = 14;
const HOVER_ORBIT_SPEED = BASE_ORBIT_SPEED * 2;
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
  const angleInRadians = (angle * Math.PI) / 180;

  return {
    x: Math.cos(angleInRadians) * ORBIT_RADIUS,
    y: Math.sin(angleInRadians) * ORBIT_RADIUS,
  };
}

export const LandingStatOrbit = memo(function LandingStatOrbit() {
  const orbitRotation = useMotionValue(0);
  const counterRotation = useTransform(orbitRotation, (value) => -value);
  const orbitSpeed = useMotionValue(BASE_ORBIT_SPEED);
  const reducedMotion = useReducedMotion();
  const speedAnimation = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    return () => speedAnimation.current?.stop();
  }, []);

  useAnimationFrame((_, delta) => {
    if (reducedMotion) {
      return;
    }

    const nextRotation = orbitRotation.get() + orbitSpeed.get() * (delta / 1000);
    orbitRotation.set(nextRotation % 360);
  });

  const animateOrbitSpeed = (nextSpeed: number) => {
    speedAnimation.current?.stop();
    speedAnimation.current = animate(orbitSpeed, nextSpeed, {
      duration: 0.16,
      ease: "easeOut",
    });
  };

  return (
    <motion.div
      className="relative mx-auto h-[400px] w-[460px]"
      onPointerEnter={reducedMotion ? undefined : () => animateOrbitSpeed(HOVER_ORBIT_SPEED)}
      onPointerLeave={reducedMotion ? undefined : () => animateOrbitSpeed(BASE_ORBIT_SPEED)}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[278px] w-[344px] -translate-x-1/2 -translate-y-1/2 rounded-[44px] border border-border/80 bg-gradient-to-br from-surface/95 via-surface/72 to-accent-light/30 shadow-[0_28px_80px_-48px_rgba(27,31,28,0.42)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[236px] w-[236px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-accent/20"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-24 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/12 blur-2xl"
        aria-hidden="true"
      />

      <motion.div
        className="absolute inset-0 will-change-transform"
        style={reducedMotion ? undefined : { rotate: orbitRotation }}
      >
        {ORBIT_CARDS.map((card) => {
          const position = getOrbitPosition(card.angle);

          return (
            <div
              key={card.label}
              className="absolute left-1/2 top-1/2"
              style={{
                left: `calc(50% + ${position.x}px)`,
                top: `calc(50% + ${position.y}px)`,
                transform: "translate(-50%, -50%)",
              }}
            >
              <motion.div
                className="w-[216px] rounded-2xl border border-border bg-surface/95 p-5 shadow-[0_22px_44px_-28px_rgba(27,31,28,0.45)] backdrop-blur-sm will-change-transform"
                style={reducedMotion ? undefined : { rotate: counterRotation }}
              >
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
              </motion.div>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  );
});
