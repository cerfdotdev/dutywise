import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How DutyWise collects, uses, and protects your data — in plain language.",
};

const sections = [
  {
    h: "What we collect",
    body: [
      "Uploaded entry data: entry numbers and duty amounts you submit for a refund audit. No PII is required to run an audit.",
      "Contact details: your email, and optionally your company name, when you run an audit or join the waitlist.",
      "Usage data: pages visited, referral source, and basic device/browser information needed to keep the site working.",
    ],
  },
  {
    h: "How we use it",
    body: [
      "To run your refund-eligibility audit and deliver your report.",
      "To file entries and refund claims on your behalf when you become a customer — never without your instruction.",
      "To send the audit result and occasional, opt-out-able updates. Every email includes an unsubscribe link.",
    ],
  },
  {
    h: "Legal bases",
    body: [
      "We process your data under contract performance (running the audit and any filing services), legitimate interest (securing the service and improving it), and consent (marketing emails).",
    ],
  },
  {
    h: "What we share",
    body: [
      "CBP and required government systems, when filing on your behalf.",
      "Software vendors who host or secure our systems, bound by contract, with least-privilege access.",
      "We never sell your data. No third-party advertising on this site.",
    ],
  },
  {
    h: "Retention",
    body: [
      "Audit uploads are deleted within 30 days of the audit unless you opt in to longer retention — and we ask before keeping anything longer.",
      "Account and filing records are kept as long as required by CBP recordkeeping rules, then deleted.",
    ],
  },
  {
    h: "Security",
    body: [
      "Data is encrypted in transit (TLS) and at rest. Access follows least-privilege. We never train AI models on your import data. A SOC 2 audit is in progress, and we'll publish the report when complete.",
    ],
  },
  {
    h: "Cookies",
    body: [
      "We use a minimal set of cookies for session and security purposes. We don't use advertising trackers.",
    ],
  },
  {
    h: "Your rights",
    body: [
      "You can request a copy of your data, ask us to delete it, correct it, or export it — email privacy@dutywise.example and we'll respond within 30 days. You can withdraw consent for marketing at any time.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="bg-ledger-paper pt-40 md:pt-48">
      <div className="shell pb-[clamp(5rem,10vw,7rem)]">
        <p className="eyebrow text-signal-blue-deep">Legal</p>
        <h1 className="mt-6 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] text-harbor-navy">
          Privacy Policy
        </h1>
        <p className="mt-6 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-ink-soft">
          Last updated January 2026. Plain language, no fine print — here is exactly what we do
          with your data.
        </p>

        <div className="mt-14 max-w-[72ch] space-y-12">
          {sections.map((section) => (
            <section key={section.h}>
              <h2 className="font-display text-2xl text-harbor-navy">{section.h}</h2>
              <div className="mt-4 space-y-3">
                {section.body.map((p) => (
                  <p key={p} className="leading-[1.75] text-ink">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-14 rounded-lg border border-hairline bg-surface p-8">
          <h2 className="font-display text-xl text-harbor-navy">Contact</h2>
          <p className="mt-3 leading-[1.75] text-ink-soft">
            DutyWise, Inc. · 1 Broker&apos;s Row, Suite 400, Wilmington, DE 19801 ·{" "}
            <a href="mailto:privacy@dutywise.example" className="text-signal-blue-deep underline underline-offset-4">
              privacy@dutywise.example
            </a>
          </p>
          <p className="mt-4 text-sm leading-[1.7] text-ink-soft">
            See also our{" "}
            <Link href="/legal/terms" className="text-signal-blue-deep underline underline-offset-4">
              Terms of Service
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
