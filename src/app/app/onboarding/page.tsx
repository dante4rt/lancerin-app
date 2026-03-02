"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [role, setRole] = useState<"freelancer" | "client">("freelancer");
  const [skills, setSkills] = useState("");
  const [hourlyMin, setHourlyMin] = useState("100000");
  const [hourlyMax, setHourlyMax] = useState("300000");
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [mobile, setMobile] = useState("081234567890");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    void fetch("/api/users/me")
      .then((res) => res.json())
      .then((data) => {
        if (!data || data.error) return;
        setRole(data.role ?? "freelancer");
        setSkills((data.skills ?? []).join(", "));
        setHourlyMin(String(data.hourly_rate_min ?? 100000));
        setHourlyMax(String(data.hourly_rate_max ?? 300000));
        setBio(data.bio ?? "");
        setPortfolio(data.portfolio_url ?? "");
        setMobile(data.mobile ?? "081234567890");
      });
  }, []);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        role,
        skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        hourly_rate_min: Number(hourlyMin),
        hourly_rate_max: Number(hourlyMax),
        bio,
        portfolio_url: portfolio,
        mobile,
      }),
    });

    setLoading(false);
    if (res.ok) {
      router.push(role === "client" ? "/app/post-gig" : "/app/swipe");
    }
  };

  return (
    <section>
      <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">01 PROFILE SETUP</p>
      <h1 className="mt-2 text-2xl font-semibold text-zinc-900">Tell us about your work</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl bg-white p-5">
        <label className="grid gap-1 text-sm">
          Role
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as "freelancer" | "client")}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option value="freelancer">Freelancer</option>
            <option value="client">Client</option>
          </select>
        </label>

        <label className="grid gap-1 text-sm">
          Skills (comma-separated)
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="nextjs, typescript, figma"
          />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Hourly rate min (IDR)
            <input
              type="number"
              value={hourlyMin}
              onChange={(e) => setHourlyMin(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
          <label className="grid gap-1 text-sm">
            Hourly rate max (IDR)
            <input
              type="number"
              value={hourlyMax}
              onChange={(e) => setHourlyMax(e.target.value)}
              className="rounded-lg border border-zinc-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          Bio
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="min-h-24 rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Portfolio URL
          <input
            value={portfolio}
            onChange={(e) => setPortfolio(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="https://"
          />
        </label>

        <label className="grid gap-1 text-sm">
          Mobile Number
          <input
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-zinc-900 px-4 py-3 text-sm font-semibold text-white hover:bg-zinc-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Profile"}
        </button>
      </form>
    </section>
  );
}
