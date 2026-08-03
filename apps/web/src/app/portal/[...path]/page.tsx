"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/portal/PortalUi";

export default function PortalCatchAll() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/portal");
  }, [router]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center gap-3 bg-harbor-navy text-mist">
      <Spinner />
      <span className="font-mono text-xs uppercase tracking-[0.18em]">
        Redirecting to overview…
      </span>
    </div>
  );
}
