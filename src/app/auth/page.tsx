import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { AuthForm } from "./auth-form";

export default async function AuthPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#050506] px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute -left-40 top-10 h-96 w-96 rounded-full bg-amber-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -right-40 bottom-10 h-96 w-96 rounded-full bg-amber-900/20 blur-3xl" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.18]"
        style={{ backgroundImage: "radial-gradient(#c8a64c 0.5px, transparent 0.5px)", backgroundSize: "22px 22px" }}
      />
      <div className="mx-auto grid w-full max-w-6xl gap-6 sm:gap-8 lg:grid-cols-[1.1fr_480px]">
        <section className="hidden rounded-[1.75rem] border border-amber-400/25 bg-black/45 p-8 text-white shadow-[0_24px_80px_-32px_rgba(0,0,0,0.85)] backdrop-blur-md lg:block lg:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-amber-200/90">Oppurtunity</p>
          <h1 className="mt-4 text-4xl font-bold leading-[1.08] tracking-[-0.04em] sm:text-5xl">
            What should you do with your NIL money?
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-300/95">
            Oppurtunity is your athlete Growth + Money OS. Turn influence into income, then grow it with premium
            financial tools.
          </p>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
            {[
              "Track what you earn in real time",
              "See where your money is going",
              "Build long-term wealth habits",
              "Premium Pro investing content",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-amber-400/15 bg-white/[0.04] p-3.5 text-sm text-slate-200/95 ring-1 ring-white/5 sm:p-4"
              >
                {item}
              </div>
            ))}
          </div>
        </section>
        <AuthForm />
      </div>
    </div>
  );
}
