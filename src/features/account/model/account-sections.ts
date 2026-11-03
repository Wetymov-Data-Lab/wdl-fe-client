export type AccountSectionId =
  | "overview"
  | "profile"
  | "sign-in"
  | "security"
  | "sessions"
  | "realms"
  | "invitations"
  | "preferences"
  | "tokens"
  | "danger";

export type AccountSection = {
  id: AccountSectionId;
  label: string;
  soon?: boolean;
  danger?: boolean;
};

export const accountSectionGroups: ReadonlyArray<{ title: string; sections: AccountSection[] }> = [
  {
    title: "Аккаунт",
    sections: [
      { id: "overview", label: "Обзор" },
      { id: "profile", label: "Профиль" },
      { id: "sign-in", label: "Входы и почта" },
      { id: "security", label: "Безопасность" },
      { id: "sessions", label: "Сессии" },
    ],
  },
  {
    title: "Работа",
    sections: [
      { id: "realms", label: "Мои реалмы" },
      { id: "invitations", label: "Приглашения", soon: true },
      { id: "preferences", label: "Настройки" },
    ],
  },
  {
    title: "Служебное",
    sections: [
      { id: "tokens", label: "Токены API", soon: true },
      { id: "danger", label: "Опасная зона", danger: true },
    ],
  },
];

const orderedSections = accountSectionGroups.flatMap((group) => group.sections);

export function accountSectionPath(id: AccountSectionId): string {
  return `/account/${id}`;
}

/** Two-digit position of the section in the navigation: "03". */
export function accountSectionNumber(id: AccountSectionId): string {
  return String(orderedSections.findIndex((section) => section.id === id) + 1).padStart(2, "0");
}

/** Eyebrow like "03 / Входы и почта" (shown in capitals by CSS). */
export function accountSectionEyebrow(id: AccountSectionId): string {
  const section = orderedSections.find((item) => item.id === id);
  return `${accountSectionNumber(id)} / ${section?.label ?? ""}`;
}
