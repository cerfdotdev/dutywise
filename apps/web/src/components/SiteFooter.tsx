import Link from "next/link";
import { disclaimers, footerColumns } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="bg-harbor-navy text-white">
      <div className="shell py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <p className="font-display text-3xl font-semibold">
              DutyWise
              <sup className="ml-1 font-mono text-xs font-normal opacity-60">®</sup>
            </p>
            <p className="mt-3 max-w-[36ch] text-[1.0625rem] leading-[1.7] text-mist">
              Duties, done right. AI-native customs brokerage with a licensed broker on every
              filing — flat per-entry pricing, refunds filed free.
            </p>
            <address className="mt-6 font-mono text-xs not-italic uppercase tracking-[0.18em] text-mist/80">
              1 Broker&apos;s Row, Suite 400
              <br />
              Wilmington, DE 19801
            </address>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className="md:col-span-2">
              <h2 className="eyebrow text-duty-amber">{col.title}</h2>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[0.9375rem] text-mist underline-offset-4 transition-colors hover:text-white hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 space-y-4 border-t border-white/10 pt-8">
          <p className="max-w-[100ch] text-sm leading-[1.7] text-mist/80">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/90">
              No-guarantee notice —{" "}
            </span>
            {disclaimers.refunds}
          </p>
          <p className="max-w-[100ch] text-sm leading-[1.7] text-mist/80">
            <span className="font-mono text-xs uppercase tracking-[0.18em] text-white/90">
              Licensure —{" "}
            </span>
            {disclaimers.licensure}
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 font-mono text-xs uppercase tracking-[0.18em] text-mist/70 md:flex-row md:items-center md:justify-between">
          <p>© 2026 DutyWise, Inc. All rights reserved.</p>
          <p>Licensed Customs Brokers · Licensed FFMCs</p>
        </div>
      </div>
    </footer>
  );
}
