"use client";

import { useState, useEffect } from "react";
import { UI_CONFIG } from "@/lib/constants";

export function useDeviceFormat() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Set initial value
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < UI_CONFIG.MOBILE_BREAKPOINT);
    };

    // Check on mount
    checkIsMobile();

    // Add event listener for resize
    window.addEventListener("resize", checkIsMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkIsMobile);
  }, []);

  return { isMobile };
}
