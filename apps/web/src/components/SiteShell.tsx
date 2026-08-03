"use client";

import { useLayoutEffect, useRef } from "react";
import { destroySmoothScroll, initLenis, type SmoothScroll } from "@/lib/design/anim";
import { Preloader } from "@/components/ui/Preloader";
import { CustomCursor } from "@/components/ui/CustomCursor";

export function SiteShell() {
  const smoothRef = useRef<SmoothScroll | null>(null);

  useLayoutEffect(() => {
    smoothRef.current = initLenis();
    return () => {
      destroySmoothScroll(smoothRef.current);
      smoothRef.current = null;
    };
  }, []);

  return (
    <>
      <Preloader />
      <CustomCursor />
    </>
  );
}
