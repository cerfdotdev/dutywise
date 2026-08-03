"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ApiError, login, me } from "@/lib/api";
import { sandboxNotice } from "@/lib/site";
import { ErrorBox, Field, Spinner, btnAmber, inputClass } from "@/components/portal/PortalUi";

export default function LoginPage() {
  const router = useRouter();
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

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      router.push("/portal");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-harbor-navy px-4 py-12">
      {sandboxNotice ? (
        <p className="mb-6 w-full max-w-md rounded-md bg-duty-amber px-4 py-2 text-center font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-ink">
          Sandbox — demo environment only
        </p>
      ) : null}
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-white/10 bg-white/[0.05] p-8">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.2em] text-mist/75">
            Customer portal
          </p>
          <h1 className="mt-2 font-display text-3xl leading-tight text-paper">
            Sign in to DutyWise
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-mist/70">
            Secure access to entries, shipments, refunds, and billing.
          </p>

          {error ? (
            <div className="mt-5">
              <ErrorBox message={error} />
            </div>
          ) : null}

          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <Field label="Email">
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
            <Field label="Password">
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
                placeholder="••••••••••"
              />
            </Field>
            <button type="submit" disabled={submitting} className={btnAmber}>
              {submitting ? <Spinner /> : null}
              Sign in
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-mist/70">
            New to DutyWise?{" "}
            <Link
              href="/portal/register"
              className="font-medium text-signal-blue transition-colors hover:text-paper"
            >
              Create an account
            </Link>
          </p>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.05] p-5">
          <p className="font-mono text-[0.6875rem] uppercase tracking-[0.16em] text-mist/75">
            Demo credentials — not real data
          </p>
          <dl className="mt-3 space-y-1.5 font-mono text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-mist/70">Email</dt>
              <dd className="text-paper">demo@dutywise.app</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-mist/70">Password</dt>
              <dd className="text-paper">demo-pass-1234</dd>
            </div>
          </dl>
          <p className="mt-3 text-xs leading-relaxed text-mist/75">
            Demo accounts only work in the sandbox. Use them to explore — no real filings or refunds.
          </p>
        </div>
      </div>
    </div>
  );
}
