import type { IdentityApi } from "@/shared/api/contracts";

const dateFormatter = new Intl.DateTimeFormat("ru-RU", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const accountStatusLabel = {
  pending: "Ожидает активации",
  active: "Активен",
  deactivated: "Деактивирован",
  suspended: "Приостановлен",
} satisfies Record<IdentityApi.AccountStatus, string>;

export function formatIdentityDate(value: string | null): string {
  return value ? dateFormatter.format(new Date(value)) : "—";
}

export function safeProfileUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export function getSessionDevice(userAgent: string): { browser: string; platform: string } {
  const browsers = [
    ["Edg/", "Microsoft Edge"],
    ["Firefox/", "Firefox"],
    ["Chrome/", "Google Chrome"],
    ["Safari/", "Safari"],
  ] as const;
  const platforms = [
    ["Mac OS", "macOS"],
    ["Windows", "Windows"],
    ["Android", "Android"],
    ["iPhone", "iOS"],
    ["iPad", "iOS"],
    ["Linux", "Linux"],
  ] as const;

  return {
    browser: browsers.find(([marker]) => userAgent.includes(marker))?.[1] ?? "Неизвестный браузер",
    platform: platforms.find(([marker]) => userAgent.includes(marker))?.[1] ?? "Неизвестное устройство",
  };
}
