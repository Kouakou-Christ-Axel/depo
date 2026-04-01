"use client";

import { useAbility } from "@/components/ability-provider";
import type { Action, Subject } from "@/lib/permissions";

interface PermissionGateProps {
  action: Action;
  subject: Subject;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Affiche les enfants seulement si l'utilisateur a la permission.
 * Usage: <PermissionGate action="create" subject="Sale">...</PermissionGate>
 */
export function PermissionGate({
  action,
  subject,
  children,
  fallback = null,
}: PermissionGateProps) {
  const ability = useAbility();

  if (ability.can(action, subject)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}
