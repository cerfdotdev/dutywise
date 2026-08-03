"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ApiError, logout, me, type Me } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card, ErrorBox, SectionTitle, Spinner } from "@/components/portal/PortalUi";

const NAV = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/entries", label: "Entries" },
  { href: "/portal/shipments", label: "Shipments" },
  { href: "/portal/refund-audit", label: "Refund audit" },
  { href: "/portal/alerts", label: "Alerts" },
  { href: "/portal/billing", label: "Billing" },
  { href: "/portal/settings", label: "Settings" },
];

const PORTAL_CSS = `
body.portal-mode { background: #0a1d31; }
body.portal-mode::after { display: none; }
body.portal-mode > header,
body.portal-mode > footer,
body.portal-mode > div[aria-hidden="true"] { display: none !important; }
`;

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [meData, setMeData] = useState<Me | null>(null);
  const [phase, setPhase] = useState<"checking" | "ready" | "error">("checking");
  const [checkError, setCheckError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const checkedRef = useRef(false);

  const isAuthPage = pathname === "/portal/login" || pathname === "/portal/register";

  useEffect(() => {
    document.body.classList.add("portal-mode");
    return () => document.body.classList.remove("portal-mode");
  }, []);

  useEffect(() => {
    if (isAuthPage || checkedRef.current) return;
    checkedRef.current = true;
    let cancelled = false;
    (async () => {
      try {
        const m = await me();
        if (!cancelled) {
          setMeData(m);
          setPhase("ready");
        }
      } catch (err) {
        if (cancelled) return;
        if (err instanceof ApiError && err.status === 401) {
          router.replace("/portal/login");
          setPhase("ready");
        } else {
          setCheckError(err instanceof ApiError ? err.message : "Something went wrong. Try again.");
          setPhase("error");
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isAuthPage, router, retryKey]);

  async function handleLogout() {
    setLoggingOut(true);
    setLogoutError(null);
    try {
      await logout();
      router.push("/portal/login");
    } catch (err) {
      setLogoutError(err instanceof ApiError ? err.message : "Sign out failed. Try again.");
      setLoggingOut(false);
    }
  }

  if (isAuthPage) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: PORTAL_CSS }} />
        {children}
      </>
    );
  }

  if (phase === "checking") {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: PORTAL_CSS }} />
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-harbor-navy">
          <Spinner className="size-6" />
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-mist/70">Checking session…</p>
        </div>
      </>
    );
  }

  if (phase === "error") {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: PORTAL_CSS }} />
        <div className="flex min-h-screen items-center justify-center bg-harbor-navy px-4">
          <Card className="w-full max-w-md">
            <SectionTitle sub="We couldn't verify your session.">Connection problem</SectionTitle>
            {checkError ? (
              <div className="mt-4">
                <ErrorBox message={checkError} />
              </div>
            ) : null}
            <div className="mt-5 w-fit">
              <Button
                variant="primary"
                magnetic={false}
                onClick={() => {
                  checkedRef.current = false;
                  setPhase("checking");
                  setRetryKey((k) => k + 1);
                }}
              >
                Try again
              </Button>
            </div>
          </Card>
        </div>
      </>
    );
  }

  if (!meData) return null;

  const active =
    NAV.slice(1).find(
      (n) => pathname === n.href || pathname.startsWith(`${n.href}/`),
    ) ??
    (pathname === "/portal" ? NAV[0] : null);
  const title = active?.label ?? "Portal";

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: PORTAL_CSS }} />
      <div className="min-h-screen bg-harbor-navy text-paper">
        <aside
          id="portal-sidebar"
          className={`fixed inset-y-0 left-0 z-40 flex w-64 transform flex-col border-r border-white/10 bg-navy-deep transition-transform duration-200 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="border-b border-white/10 px-5 py-5">
            <Link href="/portal" className="font-display text-xl font-semibold leading-none text-paper">
              DutyWise
            </Link>
            <p className="mt-1.5 font-mono text-[0.625rem] uppercase tracking-[0.18em] text-mist/75">
              Customer portal
            </p>
          </div>

          <nav aria-label="Portal" className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {NAV.map((item) => {
                const isActive =
                  item.href === "/portal" ? pathname === "/portal" : pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                        isActive ? "bg-white/10 text-paper" : "text-mist/80 hover:bg-white/5 hover:text-paper"
                      }`}
                    >
                      {item.label}
                      {isActive ? (
                        <span aria-hidden="true" className="size-1.5 rounded-full bg-duty-amber" />
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="border-t border-white/10 px-5 py-4">
            <p className="truncate text-sm font-medium text-paper">{meData.company.name}</p>
            <p className="mt-0.5 truncate font-mono text-xs text-mist/75">{meData.user.email}</p>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md border border-white/15 px-3 py-2 text-sm text-mist transition-colors hover:border-white/35 hover:text-paper disabled:opacity-60"
            >
              {loggingOut ? <Spinner /> : null}
              Sign out
            </button>
            {logoutError ? (
              <p role="alert" className="mt-2 text-xs leading-relaxed text-paper">
                {logoutError}
              </p>
            ) : null}
          </div>
        </aside>

        {sidebarOpen ? (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 z-30 bg-ink/60 md:hidden"
          />
        ) : null}

        <div className="md:pl-64">
          <header className="sticky top-0 z-20 flex h-14 items-center justify-between gap-3 border-b border-white/10 bg-harbor-navy/95 px-4 backdrop-blur md:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                aria-expanded={sidebarOpen}
                aria-controls="portal-sidebar"
                aria-label={sidebarOpen ? "Close navigation" : "Open navigation"}
                onClick={() => setSidebarOpen((v) => !v)}
                className="flex size-9 items-center justify-center rounded-md border border-white/15 text-mist transition-colors hover:text-paper md:hidden"
              >
                <span className="relative block h-3 w-4" aria-hidden="true">
                  <span className="absolute left-0 top-0 h-[2px] w-full rounded bg-current" />
                  <span className="absolute left-0 top-[5px] h-[2px] w-full rounded bg-current" />
                  <span className="absolute left-0 top-[10px] h-[2px] w-full rounded bg-current" />
                </span>
              </button>
              <h1 className="text-[0.9375rem] font-medium text-paper">{title}</h1>
            </div>
            <span className="hidden rounded-full border border-white/15 px-3 py-1 font-mono text-[0.6875rem] uppercase tracking-[0.14em] text-mist/70 sm:inline-flex">
              {meData.user.role}
            </span>
          </header>

          <div className="p-4 md:p-8 lg:p-10">{children}</div>
        </div>
      </div>
    </>
  );
}
