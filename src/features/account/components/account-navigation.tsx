import { DevicesIcon, FingerprintIcon, UserIcon } from "@/shared/ui/icons";

type AccountNavigationProps = {
  identifiersCount: number;
  sessionsCount: number;
};

export function AccountNavigation({ identifiersCount, sessionsCount }: AccountNavigationProps) {
  return (
    <aside className="account-nav" aria-label="Настройки аккаунта">
      <a className="active" href="#profile">
        <UserIcon /> Профиль
      </a>
      <a href="#overview">
        <UserIcon /> Аккаунт
      </a>
      <a href="#identifiers">
        <FingerprintIcon /> Идентификаторы <b>{identifiersCount}</b>
      </a>
      <a href="#sessions">
        <DevicesIcon /> Сессии <b>{sessionsCount}</b>
      </a>
    </aside>
  );
}
