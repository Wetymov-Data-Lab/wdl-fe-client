import { NavLink } from "react-router-dom";
import {
  accountSectionGroups,
  accountSectionNumber,
  accountSectionPath,
  type AccountSectionId,
} from "@/features/account/model/account-sections";

type AccountNavigationProps = {
  counts: Partial<Record<AccountSectionId, number>>;
};

export function AccountNavigation({ counts }: AccountNavigationProps) {
  return (
    <nav className="account-nav" aria-label="Разделы аккаунта">
      {accountSectionGroups.map((group) => (
        <div className="account-nav__group" key={group.title}>
          <span className="account-nav__title">{group.title}</span>
          {group.sections.map((section) => {
            const count = counts[section.id];
            return (
              <NavLink
                key={section.id}
                to={accountSectionPath(section.id)}
                className={({ isActive }) =>
                  ["account-nav__item", isActive && "active", section.danger && "account-nav__item--danger"]
                    .filter(Boolean)
                    .join(" ")
                }>
                <small>{accountSectionNumber(section.id)}</small>
                <span>{section.label}</span>
                {count !== undefined ? <b>{count}</b> : section.soon ? <i>SOON</i> : null}
              </NavLink>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
