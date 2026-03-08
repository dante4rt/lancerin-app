"use client";

import { FormEvent, useState } from "react";
import { motion } from "framer-motion";

export default function PostGigPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budgetMin, setBudgetMin] = useState("1000000");
  const [budgetMax, setBudgetMax] = useState("5000000");
  const [skills, setSkills] = useState("");
  const [deadline, setDeadline] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("Posting...");
    setIsError(false);

    const res = await fetch("/api/gigs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description,
        budget_min: Number(budgetMin),
        budget_max: Number(budgetMax),
        required_skills: skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        deadline,
      }),
    });

    if (res.ok) {
      setMessage("Gig posted successfully.");
      setIsError(false);
      setTitle("");
      setDescription("");
      setSkills("");
      setDeadline("");
    } else {
      setMessage("Failed to post gig.");
      setIsError(true);
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <p className="text-xs font-semibold tracking-[0.2em] text-accent">02 CLIENT FLOW</p>
      <h1 className="mt-2 text-2xl font-semibold text-text-primary">Post a new gig</h1>

      <form onSubmit={onSubmit} className="mt-6 grid gap-4 rounded-2xl bg-surface border border-border p-5">
        <label className="grid gap-1 text-sm">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-lg border border-border px-3 py-2"
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          Description
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-28 rounded-lg border border-border px-3 py-2"
            required
          />
        </label>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="grid gap-1 text-sm">
            Budget min (IDR)
            <input
              type="number"
              value={budgetMin}
              onChange={(e) => setBudgetMin(e.target.value)}
              className="rounded-lg border border-border px-3 py-2"
              required
            />
          </label>
          <label className="grid gap-1 text-sm">
            Budget max (IDR)
            <input
              type="number"
              value={budgetMax}
              onChange={(e) => setBudgetMax(e.target.value)}
              className="rounded-lg border border-border px-3 py-2"
              required
            />
          </label>
        </div>

        <label className="grid gap-1 text-sm">
          Required skills (comma-separated)
          <input
            value={skills}
            onChange={(e) => setSkills(e.target.value)}
            className="rounded-lg border border-border px-3 py-2"
            required
          />
        </label>

        <label className="grid gap-1 text-sm">
          Deadline
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            min={new Date().toISOString().split("T")[0]}
            className="rounded-lg border border-border px-3 py-2"
            required
          />
        </label>

        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-all duration-200"
        >
          Publish Gig
        </button>

        {message ? (
          <p className={`text-sm rounded-lg px-3 py-2 ${isError ? "text-red-700 bg-red-50" : "text-accent-dark bg-accent-light"}`}>
            {message}
          </p>
        ) : null}
      </form>
    </motion.section>
  );
}
