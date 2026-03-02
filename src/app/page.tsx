import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#f6f7fb_0%,_#eceff5_45%,_#e3e8f2_100%)] px-6 py-12">
      <section className="mx-auto grid w-full max-w-6xl gap-8 rounded-3xl border border-zinc-200 bg-white/80 p-8 backdrop-blur md:grid-cols-2 md:p-12">
        <div>
          <p className="text-xs font-semibold tracking-[0.2em] text-zinc-500">LANCERIN</p>
          <h1 className="mt-4 text-4xl font-bold tracking-tight text-zinc-900 md:text-5xl">
            Freelance it.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-zinc-700">
            Swipe right on gigs you want. Match faster without writing long proposals.
            AI ranks opportunities and Mayar handles invoice and payment flow.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="rounded-xl bg-zinc-900 px-5 py-3 text-sm font-semibold text-white hover:bg-zinc-700"
            >
              Get Started
            </Link>
            <Link
              href="/app/swipe"
              className="rounded-xl border border-zinc-300 px-5 py-3 text-sm font-semibold text-zinc-800 hover:bg-zinc-100"
            >
              Enter App
            </Link>
          </div>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-semibold text-zinc-900">How it works</p>
          <ol className="mt-4 space-y-3 text-sm text-zinc-700">
            <li>01. Set your profile and skills.</li>
            <li>02. Swipe through ranked gigs.</li>
            <li>03. Client picks you to create a match.</li>
            <li>04. Mayar invoice is generated automatically.</li>
            <li>05. Track payment and progress in dashboard.</li>
          </ol>
        </div>
      </section>

      <footer className="mx-auto mt-8 w-full max-w-6xl text-sm text-zinc-600">
        Tinder-style matching for tech and digital freelancing.
      </footer>
    </main>
  );
}
