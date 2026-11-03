import { useState } from "react";
import { Link } from "react-router-dom";
import { AccountSectionHeader } from "@/features/account/components/account-section-header";
import { accountSectionEyebrow, accountSectionPath } from "@/features/account/model/account-sections";
import { useAccountOutlet } from "@/pages/account/model/account-outlet-context";
import { readStoredTheme, saveTheme, type Theme } from "@/shared/lib/theme";

const themes: ReadonlyArray<{ id: Theme; label: string; description: string }> = [
  { id: "light", label: "Калька", description: "Светлая тема" },
  { id: "dark", label: "Синька", description: "Тёмная тема" },
];

export function PreferencesRoute() {
  const { account } = useAccountOutlet();
  const [theme, setTheme] = useState(readStoredTheme);

  return (
    <section className="account-section">
      <AccountSectionHeader
        eyebrow={accountSectionEyebrow("preferences")}
        title="Настройки"
        description="Тема сохраняется в этом браузере."
      />
      <div className="theme-picker" role="radiogroup" aria-label="Тема оформления">
        {themes.map((option) => (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={theme === option.id}
            className={`theme-picker__option theme-picker__option--${option.id}${theme === option.id ? " active" : ""}`}
            onClick={() => {
              saveTheme(option.id);
              setTheme(option.id);
            }}>
            <span className="theme-picker__swatch" aria-hidden="true" />
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
      <div className="account-summary__row">
        <div>
          <strong>Локаль и часовой пояс</strong>
          <span>
            {account.profile?.locale ?? "не указана"} · {account.profile?.time_zone ?? "не указан"}
          </span>
        </div>
        <Link className="button button--sm" to={accountSectionPath("profile")}>
          Изменить
        </Link>
      </div>
    </section>
  );
}
