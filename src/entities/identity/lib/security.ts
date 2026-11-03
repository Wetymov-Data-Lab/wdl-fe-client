import type { IdentityApi } from "@/shared/api/contracts";

export type SecurityStep = {
  id: "verified-email" | "second-sign-in" | "two-factor" | "stale-sessions";
  label: string;
  detail: string;
  done: boolean;
};

const staleSessionAge = 30 * 24 * 60 * 60 * 1000;

export function getStaleSessions(sessions: IdentityApi.Session[], now: number): IdentityApi.Session[] {
  return sessions.filter((session) => now - Date.parse(session.last_refreshed_at) > staleSessionAge);
}

export function getSecuritySteps(account: IdentityApi.Account, now: number): SecurityStep[] {
  const verifiedEmail = account.identifiers.find((identifier) => identifier.type === "email" && identifier.is_verified);
  const staleSessions = getStaleSessions(account.sessions, now);

  return [
    {
      id: "verified-email",
      label: "Почта подтверждена",
      detail: verifiedEmail ? verifiedEmail.value : "Подтвердите адрес, чтобы восстановить доступ при потере пароля",
      done: Boolean(verifiedEmail),
    },
    {
      id: "second-sign-in",
      label: "Есть второй способ входа",
      detail:
        account.identifiers.length > 1
          ? `Способов входа: ${account.identifiers.length}`
          : "Добавьте почту или внешний аккаунт на случай потери доступа",
      done: account.identifiers.length > 1,
    },
    {
      id: "two-factor",
      label: "Двухфакторная защита",
      detail: account.is_2fa_enforced ? "Код подтверждения при каждом входе" : "Пока не включена",
      done: account.is_2fa_enforced,
    },
    {
      id: "stale-sessions",
      label: "Нет старых сессий",
      detail: staleSessions.length
        ? `Сессий без активности больше 30 дней: ${staleSessions.length}`
        : "Все сессии обновлялись за последние 30 дней",
      done: staleSessions.length === 0,
    },
  ];
}
