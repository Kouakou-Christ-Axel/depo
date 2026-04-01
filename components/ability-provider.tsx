"use client";

import { createContext, useContext, useMemo } from "react";
import { createContextualCan } from "@casl/react";
import {
  defineAbilitiesFor,
  type AppAbility,
} from "@/lib/permissions";

const AbilityContext = createContext<AppAbility>(defineAbilitiesFor(null));

export const Can = createContextualCan(AbilityContext.Consumer);

export function AbilityProvider({
  role,
  children,
}: {
  role: string | null;
  children: React.ReactNode;
}) {
  const ability = useMemo(() => defineAbilitiesFor(role), [role]);

  return (
    <AbilityContext.Provider value={ability}>
      {children}
    </AbilityContext.Provider>
  );
}

export function useAbility() {
  return useContext(AbilityContext);
}
