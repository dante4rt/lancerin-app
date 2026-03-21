"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Icon } from "@iconify/react";
import { LandingStatOrbit } from "@/components/landing-stat-orbit";

export function LandingHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: "-60px" });

  useGSAP(
    () => {
      if (!inView || !headlineRef.current) return;

      const el = headlineRef.current;
      const text = el.textContent || "";
      const words = text.split(/\s+/);

      // Replace text with wrapped words — keep invisible until ready
      el.innerHTML = words
        .map(
          (w) =>
            `<span class="inline-block overflow-hidden"><span class="hero-word inline-block" style="transform:translateY(110%);opacity:0">${w}</span></span>`
        )
        .join(" ");

      // Now reveal the container and animate words
      gsap.set(el, { visibility: "visible" });
      gsap.to(".hero-word", {
        y: "0%",
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        delay: 0.15,
      });
    },
    { scope: sectionRef, dependencies: [inView] }
  );

  return (
    <section
      ref={sectionRef}
      className="relative px-6 pt-20 pb-14 md:pt-28 md:pb-20 lg:min-h-[calc(100dvh-40px)] flex flex-col justify-center overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-surface" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 20% 50%, var(--accent-light) 0%, transparent 70%), radial-gradient(ellipse 40% 60% at 80% 30%, rgba(107,158,123,0.08) 0%, transparent 60%)",
        }}
      />
      <div
        className="absolute -top-24 -right-24 w-[400px] h-[400px] rounded-full opacity-[0.07] blur-3xl"
        aria-hidden="true"
        style={{ background: "var(--accent)" }}
      />

      <div className="relative max-w-6xl mx-auto w-full grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
        {/* Left: copy */}
        <div className="text-center lg:text-left">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[11px] tracking-[0.25em] uppercase text-accent mb-5"
          >
            Swipe-based freelancing
          </motion.p>

          {/* Start invisible — GSAP reveals after splitting words */}
          <h1
            ref={headlineRef}
            className="text-[2.25rem] sm:text-[2.75rem] md:text-[3.25rem] lg:text-[4rem] font-bold text-text-primary leading-[1.05] tracking-[-0.035em] invisible"
          >
            Lancerin
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-2 text-lg md:text-xl lg:text-2xl font-medium text-text-secondary leading-snug tracking-[-0.01em]"
          >
            Your 24/7{" "}
            <span className="text-accent font-semibold">Freelance Matching</span>{" "}
            Assistant
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 text-base text-text-secondary max-w-[52ch] leading-relaxed mx-auto lg:mx-0"
          >
            Find gigs, match with clients, and get paid — all with a swipe. AI
            ranks opportunities and Mayar handles invoicing automatically.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/app"
              className="inline-flex items-center gap-2 bg-accent text-white px-8 py-3.5 rounded-xl font-semibold text-[15px] hover:bg-accent-hover active:scale-[0.97] transition-all duration-200"
            >
              Get Started
              <Icon icon="solar:arrow-right-linear" width={18} height={18} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center gap-2 border-2 border-border px-8 py-3.5 rounded-xl font-semibold text-[15px] text-text-primary hover:border-accent hover:text-accent transition-all duration-200"
            >
              Learn More
            </a>
          </motion.div>

          {/* Stat pills — tablet only */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden md:flex lg:hidden flex-wrap gap-3 mt-10 justify-center"
          >
            {[
              { icon: "solar:hand-stars-linear", val: "2,847", label: "swipes/day" },
              { icon: "solar:users-group-rounded-linear", val: "436", label: "matches" },
              { icon: "solar:wallet-linear", val: "Rp 47.2M", label: "invoiced" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="inline-flex items-center gap-2 bg-surface rounded-full border border-border px-4 py-2"
              >
                <Icon icon={stat.icon} width={16} height={16} className="text-accent" />
                <span className="text-sm font-semibold text-text-primary">{stat.val}</span>
                <span className="text-xs text-text-muted">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right: stat orbit — desktop only */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={inView ? { opacity: 1, scale: 1 } : undefined}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block"
        >
          <LandingStatOrbit />
        </motion.div>
      </div>
    </section>
  );
}
