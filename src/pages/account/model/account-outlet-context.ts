import { useOutletContext } from "react-router-dom";
import type { SecurityStep } from "@/entities/identity/lib/security";
import type { IdentityApi } from "@/shared/api/contracts";

export type AccountOutletContext = {
  account: IdentityApi.Account;
  sessions: IdentityApi.Session[];
  currentSessionId: string | null;
  renderedAt: number;
  securitySteps: SecurityStep[];
  profile: {
    pending: boolean;
    saved: boolean;
    error: string | null;
    submit: (input: IdentityApi.UpdateProfile) => void;
  };
  identifiers: {
    adding: boolean;
    pendingIdentifierId?: string;
    error: string | null;
    add: (input: IdentityApi.CreateIdentifier) => void;
    updatePreferences: (identifier: IdentityApi.Identifier, input: IdentityApi.IdentifierPreferences) => void;
    remove: (identifier: IdentityApi.Identifier) => void;
    dismissError: () => void;
  };
  sessionActions: {
    pendingSessionId?: string;
    hasError: boolean;
    remove: (sessionId: string) => void;
  };
};

export function useAccountOutlet(): AccountOutletContext {
  return useOutletContext<AccountOutletContext>();
}
