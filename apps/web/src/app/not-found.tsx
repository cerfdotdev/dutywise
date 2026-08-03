import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Entry not found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-ledger-paper">
      <div className="shell py-32 text-center">
        <p className="eyebrow text-signal-blue-deep">404 · NOT CLEARED</p>
        <h1 className="mt-6 font-display text-[clamp(3rem,8vw,6rem)] leading-[1.02] tracking-[-0.02em] text-harbor-navy">
          Entry not found.
        </h1>
        <p className="mx-auto mt-6 max-w-[42ch] text-[1.0625rem] leading-[1.7] text-ink-soft">
          This page never cleared customs — it may have been moved, renamed, or released to
          the wrong port.
        </p>
        <div className="mt-10 inline-flex">
          <Link
            href="/"
            className="inline-flex select-none items-center justify-center gap-2 rounded-full bg-signal-blue px-8 py-4 text-base font-medium text-white shadow-md transition-[transform,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-lg"
          >
            Back to the manifest
          </Link>
        </div>
      </div>
    </div>
  );
}
