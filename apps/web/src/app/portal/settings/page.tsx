"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ApiError, logout, me, statusLabel, type Me } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import {
  Card,
  ErrorBox,
  MiniLabel,
  SectionTitle,
  Skeleton,
  Spinner,
  errorMessage,
} from "@/components/portal/PortalUi";

const SESSION_NOTES = [
  {
    title: "httpOnly cookies",
    body: "Your session lives in httpOnly cookies — nothing is stored in browser storage or client-side state.",
  },
  {
    title: "15-minute sessions",
    body: "Sessions expire after 15 minutes of inactivity, with a rotating refresh token keeping you signed in while active.",
  },
  {
    title: "Same-origin proxy",
    body: "Every request goes through the /api proxy — credentials never touch third-party hosts.",
  },
  {
    title: "Instant sign-out",
    body: "Signing out revokes the session server-side immediately.",
  },
];

export default function SettingsPage() {
  const router = useRouter();
  const [meData, setMeData] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const m = await me();
        if (!cancelled) {
          setMeData(m);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(errorMessage(err));
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setLoggingOut(true);
    try {
      await logout();
      router.push("/portal/login");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Sign out failed. Try again.");
      setLoggingOut(false);
    }
  }

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <ErrorBox message={error} />
      </Card>
    );
  }

  if (!meData) return null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <SectionTitle sub="Your identity across the portal.">Profile</SectionTitle>
          <dl className="mt-4 space-y-4">
            <div>
              <MiniLabel>Name</MiniLabel>
              <dd className="mt-1 text-sm text-paper">{meData.user.name}</dd>
            </div>
            <div>
              <MiniLabel>Email</MiniLabel>
              <dd className="mt-1 font-mono text-sm text-paper">{meData.user.email}</dd>
            </div>
            <div>
              <MiniLabel>Role</MiniLabel>
              <dd className="mt-1">
                <span className="inline-flex rounded-full border border-white/15 px-2.5 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.08em] text-mist">
                  {statusLabel(meData.user.role)}
                </span>
              </dd>
            </div>
            <div>
              <MiniLabel>User ID</MiniLabel>
              <dd className="mt-1 font-mono text-xs text-mist/70">{meData.user.id}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <SectionTitle sub="Importer of record details on file.">Company</SectionTitle>
          <dl className="mt-4 space-y-4">
            <div>
              <MiniLabel>Name</MiniLabel>
              <dd className="mt-1 text-sm text-paper">{meData.company.name}</dd>
            </div>
            <div>
              <MiniLabel>License note</MiniLabel>
              <dd className="mt-1 text-sm text-mist/80">{meData.company.licenseNote ?? "—"}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="space-y-6">
        <Card>
          <SectionTitle sub="How your access is secured.">Session & API</SectionTitle>
          <ul className="mt-4 space-y-4">
            {SESSION_NOTES.map((note) => (
              <li key={note.title} className="border-b border-white/10 pb-4 last:border-0 last:pb-0">
                <h3 className="font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-duty-amber">
                  {note.title}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-mist/80">{note.body}</p>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <SectionTitle sub="Sign out of this browser.">Account</SectionTitle>
          <p className="mt-2 text-sm leading-relaxed text-mist/80">
            Signing out clears the session on the server. You can sign back in anytime with your
            email and password.
          </p>
          <div className="mt-4 w-fit">
            <Button
              variant="primary"
              magnetic={false}
              onClick={handleLogout}
              ariaLabel="Sign out"
            >
              {loggingOut ? <Spinner /> : null}
              Sign out
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
