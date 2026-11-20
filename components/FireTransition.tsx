"use client";

import React, { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";

interface FireTransitionContextType {
  navigateWithFire: (url: string) => void;
  triggerFire: (onMidpoint?: () => void) => void;
  isFireActive: boolean;
  fireSoundEnabled: boolean;
  setFireSoundEnabled: (val: boolean) => void;
}

const FireTransitionContext = createContext<FireTransitionContextType | null>(null);

/**
 * FireTransitionProvider
 * Fire/burning screen animation is disabled across all page navigations and interactions
 * as requested. Route transitions are instant, clean, and smooth.
 */
export function FireTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isFireActive] = useState(false);
  const [fireSoundEnabled, setFireSoundEnabled] = useState(false);

  // Instant Next.js route navigation without fire transition
  const navigateWithFire = (url: string) => {
    router.push(url);
  };

  // No-op for fire trigger; immediately triggers midpoint callback if supplied
  const triggerFire = (onMidpoint?: () => void) => {
    if (onMidpoint) {
      onMidpoint();
    }
  };

  return (
    <FireTransitionContext.Provider
      value={{
        navigateWithFire,
        triggerFire,
        isFireActive,
        fireSoundEnabled,
        setFireSoundEnabled,
      }}
    >
      {children}
    </FireTransitionContext.Provider>
  );
}

export function useFire() {
  const context = useContext(FireTransitionContext);
  if (!context) {
    throw new Error("useFire must be used within a FireTransitionProvider");
  }
  return context;
}
