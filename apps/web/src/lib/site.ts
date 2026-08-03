export type NavLink = { href: string; label: string };

export const navLinks: NavLink[] = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/refund-audit", label: "Refund audit" },
];

export type FooterColumn = { title: string; links: NavLink[] };

export const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { href: "/#how-it-works", label: "How it works" },
      { href: "/pricing", label: "Pricing" },
      { href: "/refund-audit", label: "Refund audit" },
    ],
  },
  {
    title: "Company",
    links: [
      { href: "/#", label: "About" },
      { href: "/#", label: "Careers" },
      { href: "mailto:hello@dutywise.example", label: "Contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { href: "/legal/privacy", label: "Privacy" },
      { href: "/legal/terms", label: "Terms" },
    ],
  },
];

export const marqueeItems: string[] = [
  "CBP-licensed brokers",
  "AES direct",
  "SOFI integrated",
  "$0 handling",
  "Licensed broker on every filing",
  "No volume minimums",
];

export type FaqItem = { id: string; question: string; answer: string };

export const faqItems: FaqItem[] = [
  {
    id: "licensed",
    question: "Is DutyWise a licensed customs broker?",
    answer:
      "Yes. Licensed brokers are on staff and sign 100% of filings. We're also a licensed FFMC for freight-forwarding services. Software speeds the work; licensed professionals own it.",
  },
  {
    id: "price",
    question: "What exactly do I pay per entry?",
    answer:
      "$99 (starter), $89 (2,000+ entries/quarter), $69 (10,000+). That's the entire entry fee — $0 handling, $0 per-line fees, $0 minimums. You'll see the same numbers on your invoice.",
  },
  {
    id: "percent",
    question: "Do you really file refunds with no percentage cut?",
    answer:
      "Yes. If you're owed duties under CAPE, IEEPA, or a retroactive rate change, we prepare and file the claim as part of your plan. We don't take a % of the refund — you keep what CBP pays.",
  },
  {
    id: "cape",
    question: "How do refunds under CAPE/IEEPA actually work?",
    answer:
      "When CBP or the courts retroactively lower a duty rate, importers who paid the old rate can claim the difference (typically via Post-Summary Correction or protest). We monitor rulings that apply to your HTS codes and file on your behalf. Eligibility is CBP's call — when they approve, they pay you directly.",
  },
  {
    id: "switch",
    question: "Do I have to switch brokers to use the refund audit?",
    answer:
      "No. The audit is free and needs no commitment. If you like the result, you can use DutyWise for filing, or take the report to your current broker.",
  },
  {
    id: "speed",
    question: "How fast are entries filed?",
    answer:
      "Median under 2 minutes of processing time after data is received. Same-day filing is standard; we flag any entry needing human review before it goes out.",
  },
  {
    id: "needed",
    question: "What do you need from us to file?",
    answer:
      "Commercial invoice or ERP/EDI data, importer-of-record details, and your surety/bond info. We map to your existing workflow — API, CSV, or email — no re-keying.",
  },
  {
    id: "data",
    question: "Is my data safe?",
    answer:
      "Uploaded files are encrypted in transit and at rest, processed with least-privilege access, and deleted after 30 days unless you opt in to longer retention. We never train models on your import data. SOC 2 audit is in progress.",
  },
  {
    id: "rejected",
    question: "What if CBP rejects a refund claim we file?",
    answer:
      "You owe nothing for that claim — no-win, no-fee. You'll get a plain-English explanation of why, and options (protest, appeal, or drop it).",
  },
  {
    id: "multilocation",
    question: "Can you handle multi-location or bonded shipments?",
    answer:
      "Yes. One DutyWise account consolidates all locations, carriers, and entry types — one invoice, one dashboard, one flat per-entry price. Multi-entity importers get the $69 band fastest.",
  },
];

export const pricingFaqItems: FaqItem[] = [
  faqItems.find((f) => f.id === "price")!,
  faqItems.find((f) => f.id === "percent")!,
  faqItems.find((f) => f.id === "rejected")!,
  faqItems.find((f) => f.id === "switch")!,
];

export const auditFaqItems: FaqItem[] = [
  faqItems.find((f) => f.id === "switch")!,
  faqItems.find((f) => f.id === "cape")!,
  faqItems.find((f) => f.id === "data")!,
  faqItems.find((f) => f.id === "percent")!,
];

export const disclaimers = {
  refunds:
    "DutyWise does not guarantee refunds. Eligibility for refunds, protests, or corrections is determined solely by CBP and the courts. Estimates are estimates — never claims.",
  licensure:
    "DutyWise, Inc. is a licensed customs broker and licensed FFMC. Broker license numbers are available on request. All filings are signed by a licensed broker.",
  sandbox:
    "Sandbox environment — demo data only. No real entries are filed and no real refunds are processed here.",
  anchorMath:
    "A 2,000-entry year at a typical broker ≈ $180K–$320K. Same volume at DutyWise ≈ $138K–$198K, all-in.",
};

export const sandboxNotice =
  process.env.NEXT_PUBLIC_SANDBOX_NOTICE === "true";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
