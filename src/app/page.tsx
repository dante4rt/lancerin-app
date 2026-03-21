"use client";

import { type ReactNode, useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { Icon } from "@iconify/react";
import { LandingHero } from "@/components/landing-hero";
import { LandingFeatures } from "@/components/landing-features";
import { LandingCta } from "@/components/landing-cta";

/* ─── Scroll-triggered reveal ──────────────────────────── */

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Data ─────────────────────────────────────────────── */

const CATEGORIES = [
  "Web Development",
  "Mobile Apps",
  "UI/UX Design",
  "Content Writing",
  "Data Science",
  "Digital Marketing",
  "Video Editing",
  "DevOps",
];

const LOGOS = [
  { icon: "simple-icons:google", name: "Google" },
  { icon: "simple-icons:nextdotjs", name: "Next.js" },
  { icon: "simple-icons:framer", name: "Framer" },
  { icon: "simple-icons:openai", name: "OpenAI" },
  { icon: "simple-icons:stripe", name: "Stripe" },
];

const HOW_IT_WORKS = [
  {
    label: "AI-Powered Ranking",
    icon: "solar:star-linear",
    title: "Smart gig matching",
    desc: "Our AI analyzes your skills, hourly rate, and work history to rank gigs by relevance. The more you swipe, the better it learns your preferences.",
  },
  {
    label: "Swipe-Based Discovery",
    icon: "solar:hand-stars-linear",
    title: "Discover gigs naturally",
    desc: "Browse a curated feed tailored to you. Swipe right to express interest, left to pass. Clients see who's interested and pick their match.",
  },
  {
    label: "Instant Mayar Invoicing",
    icon: "solar:wallet-linear",
    title: "Automatic payment flow",
    desc: "When a match is confirmed, Mayar generates an invoice automatically. Clients pay through the link — no manual billing, no chasing payments.",
  },
  {
    label: "Real-Time Dashboard",
    icon: "solar:chart-square-linear",
    title: "Track everything",
    desc: "Monitor earnings, pending payments, completed gigs, and active matches from a single dashboard. Export transaction history anytime.",
  },
  {
    label: "Skills-Based Matching",
    icon: "solar:users-group-rounded-linear",
    title: "Right skills, right gig",
    desc: "Tag your skills during onboarding. Lancerin matches you with gigs that need exactly what you offer — no more irrelevant posts.",
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "Free",
    desc: "For freelancers getting started",
    features: ["Unlimited swipes", "AI-ranked feed", "Basic profile", "Mayar invoicing"],
    highlighted: false,
  },
  {
    name: "Professional",
    price: "Rp 149k",
    period: "/mo",
    desc: "For active freelancers",
    features: ["Everything in Starter", "Priority in rankings", "Analytics dashboard", "Portfolio showcase"],
    highlighted: true,
  },
  {
    name: "Business",
    price: "Rp 249k",
    period: "/mo",
    desc: "For clients and teams",
    features: ["Unlimited gig posts", "Bulk freelancer picks", "Team collaboration", "Dedicated support"],
    highlighted: false,
  },
];

const FAQS = [
  {
    q: "How does Lancerin match freelancers with gigs?",
    a: "Our AI analyzes your skills, hourly rate, bio, and swipe history to rank gigs by relevance. You swipe right on gigs you like, and clients choose from the pool of interested freelancers.",
  },
  {
    q: "Is Lancerin free to use?",
    a: "Yes, Lancerin is free for freelancers. Clients can post gigs at no cost. A small transaction fee applies when invoices are processed through Mayar.",
  },
  {
    q: "How does payment work?",
    a: "When a client picks you for a gig, Mayar automatically generates an invoice. The client pays through the invoice link, and you can track all transactions on your dashboard.",
  },
  {
    q: "What types of gigs are available?",
    a: "Lancerin covers digital freelancing: web development, mobile apps, UI/UX design, content writing, data science, digital marketing, video editing, DevOps, and more.",
  },
  {
    q: "Can I use Lancerin as both a freelancer and a client?",
    a: "You choose your role during onboarding. Freelancers swipe on gigs and get matched. Clients post gigs and pick from interested freelancers.",
  },
];

/* ─── Page ─────────────────────────────────────────────── */

export default function HomePage() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* ── Vertical container guide lines (desktop) ── */}
      <div
        className="pointer-events-none fixed inset-y-0 left-0 right-0 z-50 hidden lg:block"
        aria-hidden="true"
      >
        <div className="mx-auto h-full max-w-6xl px-6">
          <div className="h-full border-x border-border/15" />
        </div>
      </div>

      {/* ── Top accent banner ── */}
      <div className="bg-accent text-white text-center py-2.5 px-4 text-[13px] font-medium tracking-wide">
        Swipe. Match. Get paid — the fastest way to find freelance gigs.
      </div>

      {/* ── 01 HERO (GSAP word stagger) ── */}
      <LandingHero />

      {/* ── Hero visual — scrolling categories strip ── */}
      <section className="bg-surface px-6 pb-16 md:pb-24 overflow-hidden">
        <Reveal className="max-w-6xl mx-auto">
          <div className="relative py-6 border-y border-border">
            {/* Gradient fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-surface to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-surface to-transparent z-10 pointer-events-none" />
            <motion.div
              className="flex gap-6 whitespace-nowrap"
              animate={{ x: "-50%" }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: "linear",
                repeatType: "loop",
              }}
            >
              {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map(
                (cat, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-2 text-sm font-medium text-text-muted"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/40" />
                    {cat}
                  </span>
                ),
              )}
            </motion.div>
          </div>
        </Reveal>
      </section>

      {/* ── 02 PARTNERS ── */}
      <section className="bg-surface border-y border-border px-6 py-12">
        <Reveal className="max-w-5xl mx-auto">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16">
            {LOGOS.map((logo) => (
              <Icon
                key={logo.name}
                icon={logo.icon}
                width={72}
                height={28}
                className="text-text-muted/35 hover:text-text-secondary transition-colors duration-300 md:w-24 md:h-9"
              />
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative bg-background bg-dots px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-accent mb-3">
              How it works
            </p>
            <h2 className="text-3xl md:text-[2.75rem] font-bold text-text-primary leading-[1.1] tracking-[-0.02em] mb-12 md:mb-16">
              From swipe to payment<br />
              <span className="text-text-secondary">in three steps</span>
            </h2>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-start">
            {/* Clickable feature list — shows first on mobile */}
            <Reveal className="order-1 md:order-2">
              <div className="space-y-1.5">
                {HOW_IT_WORKS.map((item, i) => {
                  const isActive = activeFeature === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveFeature(i)}
                      className={`w-full flex items-center gap-3 py-3.5 px-4 rounded-lg text-left transition-all duration-200 ${
                        isActive
                          ? "bg-accent-light border border-accent"
                          : "hover:bg-surface border border-transparent"
                      }`}
                    >
                      <Icon
                        icon={isActive ? "solar:check-circle-bold" : "solar:check-circle-linear"}
                        width={20}
                        height={20}
                        className={isActive ? "text-accent shrink-0" : "text-text-muted shrink-0"}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "text-accent-dark" : "text-text-primary"
                        }`}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Reveal>

            {/* Detail panel — changes based on selected feature */}
            <div className="order-2 md:order-1">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeFeature}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.25, ease: "easeInOut" }}
                  className="bg-surface rounded-2xl border border-border p-6 md:p-8 shadow-sm"
                >
                  <div className="w-12 h-12 rounded-xl bg-accent-light flex items-center justify-center mb-5">
                    <Icon
                      icon={HOW_IT_WORKS[activeFeature].icon}
                      width={24}
                      height={24}
                      className="text-accent"
                    />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary mb-3">
                    {HOW_IT_WORKS[activeFeature].title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {HOW_IT_WORKS[activeFeature].desc}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 TESTIMONIAL ── */}
      <section className="bg-surface px-6 py-20 md:py-24">
        <Reveal className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-2xl font-medium text-text-primary leading-relaxed tracking-[-0.01em]">
            &ldquo;Finding the right freelancer used to take weeks of proposal
            reviews. Now it happens with a single swipe.&rdquo;
          </blockquote>
          <div className="mt-8 flex items-center justify-center gap-3">
            <img
              src="https://api.dicebear.com/9.x/open-peeps/svg?seed=Lucky+Aditya"
              alt=""
              className="w-10 h-10 rounded-full bg-accent-light"
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-text-primary">Lucky Aditya</p>
              <p className="text-xs text-text-muted">Product Lead, Startup Jakarta</p>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── 05 FEATURES (GSAP scroll stagger) ── */}
      <LandingFeatures />

      {/* ── 06 PRICING ── */}
      <section className="bg-surface px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-[2.75rem] font-bold text-text-primary text-center leading-[1.1] tracking-[-0.02em]">
              Pricing and plans
            </h2>
          </Reveal>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {PLANS.map((plan, i) => (
              <Reveal key={i} delay={i * 0.1}>
                <motion.div
                  whileHover={{ y: -6, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`rounded-2xl border p-7 transition-[border-color,box-shadow] duration-300 h-full ${
                    plan.highlighted
                      ? "border-accent bg-accent-light/30 shadow-lg ring-1 ring-accent/20"
                      : "border-border bg-surface hover:border-accent/40"
                  }`}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-muted">
                    {plan.name}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-text-primary tracking-[-0.02em]">
                      {plan.price}
                    </span>
                    {plan.period ? (
                      <span className="text-sm text-text-muted">{plan.period}</span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm text-text-secondary">{plan.desc}</p>

                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm text-text-primary">
                        <Icon
                          icon="solar:check-circle-linear"
                          width={16}
                          height={16}
                          className="text-accent shrink-0"
                        />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/app"
                    className={`mt-8 block w-full text-center py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.97] ${
                      plan.highlighted
                        ? "bg-accent text-white hover:bg-accent-hover"
                      : "bg-accent-light text-accent-dark hover:bg-accent hover:text-white"
                    }`}
                  >
                    {plan.highlighted ? "Start Free Trial" : "Get Started"}
                  </Link>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── 07 FAQ ── */}
      <section className="bg-background px-6 py-20 md:py-24">
        <div className="max-w-3xl mx-auto">
          <Reveal>
            <h2 className="text-3xl md:text-[2.75rem] font-bold text-text-primary text-center leading-[1.1] tracking-[-0.02em]">
              Frequently asked questions
            </h2>
          </Reveal>

          <div className="mt-12 space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <Reveal key={i} delay={i * 0.06}>
                  <div
                    className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                      isOpen ? "border-accent" : "border-border"
                    }`}
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                      className="w-full flex items-center justify-between p-5 text-left bg-surface hover:bg-surface/80 transition-all duration-200"
                    >
                      <span className="font-semibold text-text-primary pr-4">{faq.q}</span>
                      <Icon
                        icon="solar:alt-arrow-down-linear"
                        width={20}
                        height={20}
                        className={`text-text-muted shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    <div
                      className={`grid transition-all duration-300 ease-in-out ${
                        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <p className="px-5 pb-5 text-sm text-text-secondary leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 08 SECURITY ── */}
      <section className="bg-surface px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <Reveal>
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary text-center tracking-[-0.02em]">
              Secure by default
            </h2>
            <p className="mt-4 text-text-secondary text-center max-w-xl mx-auto">
              All gig data is securely stored and routed through Mayar for
              verified, traceable payment processing.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 md:grid-cols-2 max-w-3xl mx-auto">
            <Reveal delay={0.1}>
              <div className="flex items-start gap-4 bg-background rounded-xl border border-border p-5">
                <Icon
                  icon="solar:shield-check-linear"
                  width={24}
                  height={24}
                  className="text-accent shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">Google OAuth</p>
                  <p className="text-xs text-text-secondary mt-1">
                    Industry-standard authentication. No passwords stored.
                  </p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex items-start gap-4 bg-background rounded-xl border border-border p-5">
                <Icon
                  icon="solar:lock-linear"
                  width={24}
                  height={24}
                  className="text-accent shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">Mayar Payment Processing</p>
                  <p className="text-xs text-text-secondary mt-1">
                    All invoices handled by Mayar with verified billing.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CTA (GSAP word stagger + line draw-in) ── */}
      <LandingCta />

      {/* ── Footer ── */}
      <footer className="bg-dark-bg border-t border-white/10 px-6 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-dark-muted">
          <span>Lancerin — Mayar Vibecoding Competition 2026</span>
          <div className="flex gap-6">
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
