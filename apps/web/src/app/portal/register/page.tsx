"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, register, me } from "@/lib/api";
import { ErrorBox, Field, Spinner, btnAmber, inputClass } from "@/components/portal/PortalUi";

function passwordStrength(pw: string): { level: number; label: string; tone: string } {
  if (!pw) return { level: 0, label: "", tone: "" };
  if (pw.length < 10) return { level: 1, label: "Too short — 10+ characters", tone: "bg-duty-amber" };
  let level = 2;
  if (/[0-9]/.test(pw)) level += 1;
  if (/[^A-Za-z0-9]/.test(pw)) level += 1;
  const label = level >= 4 ? "Strong" : level === 3 ? "Good" : "Fair";
  const tone = level >= 4 ? "bg-clearance-green" : "bg-signal-blue";
  return { level, label, tone };
}

export default function RegisterPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await me();
        if (!cancelled) router.replace("/portal");
      } catch {
        // not signed in — show the form
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const strength = passwordStrength(password);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await register({
        companyName: companyName.trim(),
        name: name.trim(),
        email: email.trim(),
        password,
      });
      router.push("/portal");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-harbor-navy px-4 py-12">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-8">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-mist/75">
            Customer portal
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-paper">
            Create your account
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mist/70">
            Set up your company profile and start filing entries with a licensed broker.
          </p>

          {error ? (
            <div className="mt-5">
              <ErrorBox message={error} />
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Company name">
              <input
                type="text"
                required
                autoComplete="organization"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className={inputClass}
                placeholder="Acme Imports Inc."
              />
            </Field>
            <Field label="Your name">
              <input
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                placeholder="Jordan Lee"
              />
            </Field>
            <Field label="Work email">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
                placeholder="you@company.com"
              />
            </Field>
            <Field
              label="Password"
              hint="At least 10 characters. Mix in numbers and symbols for a stronger password."
            >
              <input
                type="password"
                required
                minLength={10}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••••••"
              />
              <div className="mt-2 flex items-center gap-3">
                <div className="flex flex-1 gap-1" aria-hidden="true">
                  {[1, 2, 3, 4].map((i) => (
                    <span
                      key={i}
                      className={`h-1 flex-1 rounded-full ${i <= strength.level ? strength.tone : "bg-white/10"}`}
                    />
                  ))}
                </div>
                {strength.label ? (
                  <span className="font-mono text-[0.6875rem] uppercase tracking-[0.1em] text-mist/75">
                    {strength.label}
                  </span>
                ) : null}
              </div>
            </Field>
            <button type="submit" disabled={submitting} className={btnAmber}>
              {submitting ? <Spinner /> : null}
              Create account
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-mist/70">
            Already have an account?{" "}
            <Link
              href="/portal/login"
              className="font-medium text-signal-blue transition-colors hover:text-paper"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
