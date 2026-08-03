import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of DutyWise — brokerage, refund filing, pricing, and the no-guarantee clause.",
};

const sections = [
  {
    h: "1. Who we are",
    body: [
      "DutyWise, Inc. ('DutyWise', 'we', 'us') provides AI-assisted customs brokerage and related trade-compliance services. We are a licensed customs broker and licensed FFMC; a licensed broker signs 100% of filings we prepare. Our software accelerates the work — licensed professionals own it.",
    ],
  },
  {
    h: "2. Services",
    body: [
      "Entry filing (customs entries transmitted to CBP), refund and protest filing (CAPE, IEEPA, retroactive rate changes, Post-Summary Corrections), tariff monitoring, compliance reporting, and the free refund audit.",
      "The refund audit produces estimates of eligibility and refund size. Estimates are not claims, not approvals, and not a promise of payment.",
    ],
  },
  {
    h: "3. No guarantee of refunds",
    body: [
      "DutyWise does not guarantee that any refund, protest, or correction will be granted. Eligibility for refunds is determined solely by CBP and the courts. When we say 'we file, CBP pays,' we mean exactly that: we prepare and file the claim, and CBP — not us — decides and pays.",
      "No-win, no-fee: if CBP rejects a refund claim that we prepared and filed in accordance with your instructions, you owe nothing for that claim.",
    ],
  },
  {
    h: "4. Pricing and invoicing",
    body: [
      "Fees are published per entry: $99 (starter), $89 (2,000+ entries/quarter), $69 (10,000+ entries/quarter). Add-ons (ISF, bond, disbursement) are quoted before use. There are no handling fees, no per-line fees, and no monthly minimums.",
      "Invoices are issued monthly and payable within 30 days. We may suspend filings for accounts more than 60 days past due, with notice.",
    ],
  },
  {
    h: "5. Your responsibilities",
    body: [
      "You agree to provide accurate importer-of-record details, commercial data, and bond/surety information, and to review entries flagged for human review. You are responsible for the accuracy of data you supply.",
    ],
  },
  {
    h: "6. Acceptable use",
    body: [
      "You may not use the service to transmit unlawful data, to file entries for goods you are not authorized to import, or to abuse, probe, or disrupt the service. Uploading more than 5,000 entries per audit is not supported.",
    ],
  },
  {
    h: "7. Intellectual property",
    body: [
      "The DutyWise platform, design, and content are ours. You keep ownership of your import data. We never train models on your data.",
    ],
  },
  {
    h: "8. Limitation of liability",
    body: [
      "To the maximum extent permitted by law, our aggregate liability arising out of or related to the service is limited to the fees you paid in the twelve months before the event giving rise to the claim. We are not liable for indirect, incidental, or consequential damages, including lost profits or business interruption.",
      "Nothing in these terms limits liability for fraud, gross negligence, willful misconduct, or any liability that cannot be limited by law.",
    ],
  },
  {
    h: "9. Indemnification",
    body: [
      "You agree to indemnify DutyWise against claims arising from your data, your use of the service, or your breach of these terms — except where the claim results from our gross negligence or willful misconduct.",
    ],
  },
  {
    h: "10. Disputes",
    body: [
      "Before any action, we'll try to resolve the matter informally — write to legal@dutywise.example and we'll respond within 30 days. Unresolved disputes are governed by the laws of the State of Delaware, without regard to conflict-of-laws rules, and any action must be filed in the state or federal courts of Delaware.",
    ],
  },
  {
    h: "11. Changes",
    body: [
      "We may update these terms with 30 days' notice by email or in-app notice. Continued use of the service after the effective date constitutes acceptance. Material changes never apply retroactively to completed filings.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="bg-ledger-paper pt-40 md:pt-48">
      <div className="shell pb-[clamp(5rem,10vw,7rem)]">
        <p className="eyebrow text-signal-blue-deep">Legal</p>
        <h1 className="mt-6 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[1.02] text-harbor-navy">
          Terms of Service
        </h1>
        <p className="mt-6 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-ink-soft">
          Last updated January 2026. Read the no-guarantee clause in Section 3 carefully — it is
          the most important one.
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
            <a href="mailto:legal@dutywise.example" className="text-signal-blue-deep underline underline-offset-4">
              legal@dutywise.example
            </a>
          </p>
          <p className="mt-4 text-sm leading-[1.7] text-ink-soft">
            See also our{" "}
            <Link href="/legal/privacy" className="text-signal-blue-deep underline underline-offset-4">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
