export default function Loading() {
  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-ledger-paper" aria-live="polite">
      <div className="flex flex-col items-center gap-5">
        <svg width="56" height="56" viewBox="0 0 56 56" fill="none" aria-hidden="true" className="animate-spin-slow">
          <circle cx="28" cy="28" r="24" stroke="#E5DFD3" strokeWidth="2" />
          <circle cx="28" cy="28" r="24" stroke="#2E6FD9" strokeWidth="2" strokeDasharray="38 120" strokeLinecap="round" />
        </svg>
        <p className="font-mono text-xs uppercase tracking-[0.18em] text-ink-soft">
          Checking the manifest…
        </p>
      </div>
    </div>
  );
}
