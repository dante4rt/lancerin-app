"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";

gsap.registerPlugin(ScrollTrigger);

const FEATURES = [
  {
    icon: "solar:users-group-rounded-linear",
    title: "Reach freelancers where they are",
    desc: "Post gigs and let matched freelancers come to you through swipe-based interest signals.",
  },
  {
    icon: "solar:star-linear",
    title: "AI scores every match",
    desc: "Our AI analyzes skills, rates, and history to rank the best-fit gigs for every freelancer.",
  },
  {
    icon: "solar:chat-round-dots-linear",
    title: "Dual-role support",
    desc: "Whether hiring or freelancing, switch between posting gigs and swiping on opportunities.",
  },
  {
    icon: "solar:smartphone-2-linear",
    title: "Swipe from anywhere",
    desc: "A responsive interface that works on any device. Browse and match on the go.",
  },
  {
    icon: "solar:wallet-linear",
    title: "Automated invoicing",
    desc: "Invoices generated the moment a match is created. No manual billing through Mayar.",
  },
  {
    icon: "solar:chart-square-linear",
    title: "Track payments and progress",
    desc: "A built-in dashboard shows earnings, pending payments, and transaction history.",
  },
];

export function LandingFeatures() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Stagger cards on scroll with GSAP ScrollTrigger
      const cards = gsap.utils.toArray<HTMLElement>(".feature-card");

      cards.forEach((card, i) => {
        gsap.from(card, {
          y: 50,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          delay: i * 0.06,
          scrollTrigger: {
            trigger: card,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        });
      });

      // Icon bg color shift on hover (accent-light → accent)
      cards.forEach((card) => {
        const iconBox = card.querySelector(".feature-icon-box");
        const icon = card.querySelector(".feature-icon");
        if (!iconBox || !icon) return;

        card.addEventListener("mouseenter", () => {
          gsap.to(iconBox, { backgroundColor: "var(--accent)", duration: 0.25, ease: "power2.out" });
          gsap.to(icon, { color: "#fff", duration: 0.25, ease: "power2.out" });
        });
        card.addEventListener("mouseleave", () => {
          gsap.to(iconBox, { backgroundColor: "var(--accent-light)", duration: 0.3, ease: "power2.out" });
          gsap.to(icon, { color: "var(--accent)", duration: 0.3, ease: "power2.out" });
        });
      });
    },
    { scope: sectionRef }
  );

  const leftCol = FEATURES.filter((_, i) => i % 2 === 0);
  const rightCol = FEATURES.filter((_, i) => i % 2 === 1);

  return (
    <section ref={sectionRef} className="relative bg-background bg-dots px-6 py-20 md:py-28">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-[2.75rem] font-bold text-text-primary leading-[1.1] tracking-[-0.02em]">
          Your freelance workflow,
          <br />
          <span className="text-accent">supercharged</span>
        </h2>

        {/* Asymmetric 2-col grid: first col offset down for zig-zag feel */}
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {/* Left column — offset top on desktop */}
          <div className="space-y-5 md:pt-12">
            {leftCol.map((feat, i) => (
              <div
                key={i}
                className="feature-card group bg-surface rounded-2xl border border-border p-7 hover:border-accent/60 hover:shadow-md transition-[border-color,box-shadow] duration-300"
              >
                <div className="feature-icon-box w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center mb-5 transition-colors duration-300">
                  <Icon
                    icon={feat.icon}
                    width={22}
                    height={22}
                    className="feature-icon text-accent transition-colors duration-300"
                  />
                </div>
                <h3 className="text-[15px] font-bold text-text-primary mb-2 leading-snug">
                  {feat.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
          {/* Right column — flush top */}
          <div className="space-y-5">
            {rightCol.map((feat, i) => (
              <div
                key={i}
                className="feature-card group bg-surface rounded-2xl border border-border p-7 hover:border-accent/60 hover:shadow-md transition-[border-color,box-shadow] duration-300"
              >
                <div className="feature-icon-box w-11 h-11 rounded-xl bg-accent-light flex items-center justify-center mb-5 transition-colors duration-300">
                  <Icon
                    icon={feat.icon}
                    width={22}
                    height={22}
                    className="feature-icon text-accent transition-colors duration-300"
                  />
                </div>
                <h3 className="text-[15px] font-bold text-text-primary mb-2 leading-snug">
                  {feat.title}
                </h3>
                <p className="text-sm text-text-secondary leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
