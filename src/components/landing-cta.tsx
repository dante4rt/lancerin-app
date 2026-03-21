"use client";

import { useRef } from "react";
import Link from "next/link";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Icon } from "@iconify/react";

gsap.registerPlugin(ScrollTrigger);

export function LandingCta() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      // Animate headline words stagger on scroll
      const heading = sectionRef.current?.querySelector(".cta-heading");
      if (!heading) return;

      const text = heading.textContent || "";
      const words = text.trim().split(/\s+/);
      heading.innerHTML = words
        .map(
          (w) =>
            `<span class="inline-block overflow-hidden"><span class="cta-word inline-block">${w}</span></span>`
        )
        .join(" ");

      gsap.from(".cta-word", {
        y: "110%",
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });

      // Dashed lines draw-in from center
      const lines = gsap.utils.toArray<HTMLElement>(".cta-dash-line");
      lines.forEach((line) => {
        gsap.from(line, {
          scaleX: 0,
          duration: 1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        });
      });

      // Button fade up
      gsap.from(".cta-button", {
        y: 30,
        opacity: 0,
        duration: 0.6,
        ease: "power2.out",
        delay: 0.4,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 70%",
          toggleActions: "play none none none",
        },
      });
    },
    { scope: sectionRef }
  );

  return (
    <section ref={sectionRef} className="bg-dark-bg px-6 py-20 md:py-28 overflow-hidden">
      <div className="relative max-w-5xl mx-auto text-center">
        {/* Dashed lines — left and right, draw from center */}
        <div
          className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
          aria-hidden="true"
        >
          <div className="cta-dash-line flex-1 border-t-2 border-dashed border-dark-muted/25 origin-right" />
          <div className="w-[min(600px,80vw)] shrink-0" />
          <div className="cta-dash-line flex-1 border-t-2 border-dashed border-dark-muted/25 origin-left" />
        </div>

        <p className="font-mono text-[11px] tracking-[0.3em] uppercase text-dark-muted mb-8">
          Ready to start?
        </p>

        <h2 className="cta-heading relative text-4xl md:text-7xl lg:text-8xl font-bold text-dark-text leading-[0.95] tracking-[-0.03em] uppercase">
          We&rsquo;re ready to go
        </h2>

        <Link
          href="/app"
          className="cta-button inline-flex items-center gap-2 mt-10 bg-[#EEF1EF] text-dark-bg px-10 py-4 rounded-full font-semibold text-[15px] hover:bg-background active:scale-[0.97] transition-all duration-200"
        >
          Get started
          <Icon icon="solar:arrow-right-linear" width={18} height={18} />
        </Link>
      </div>
    </section>
  );
}
