import { Link } from "react-router-dom";
import { getStaleSessions } from "@/entities/identity/lib/security";
import { AccountSectionHeader } from "@/features/account/components/account-section-header";
import { AccountPlaceholder } from "@/features/account/components/account-placeholder";
import { accountSectionEyebrow, accountSectionPath } from "@/features/account/model/account-sections";
import { useAccountOutlet } from "@/pages/account/model/account-outlet-context";

export function SecurityRoute() {
  const { account, renderedAt } = useAccountOutlet();
  const staleSessions = getStaleSessions(account.sessions, renderedAt);

  return (
    <>
      <section className="account-section">
        <AccountSectionHeader eyebrow={accountSectionEyebrow("security")} title="Безопасность" />
        <div className="security-step">
          <span className="security-step__mark" aria-hidden="true">
            {account.is_2fa_enforced ? "OK" : "!"}
          </span>
          <div>
            <strong>Двухфакторная защита</strong>
            <span>{account.is_2fa_enforced ? "Обязательна для этого аккаунта" : "Сейчас не требуется для входа"}</span>
          </div>
          <span className="security-step__status">{account.is_2fa_enforced ? "Включена" : "Не включена"}</span>
        </div>
        <div className="security-step">
          <span className="security-step__mark" aria-hidden="true">
            {account.sessions.length}
          </span>
          <div>
            <strong>Активные сессии</strong>
            <span>
              {staleSessions.length
                ? `Без активности больше 30 дней: ${staleSessions.length}`
                : "Все сессии обновлялись за последние 30 дней"}
            </span>
          </div>
          <Link className="button button--sm" to={accountSectionPath("sessions")}>
            К сессиям
          </Link>
        </div>
      </section>
      <AccountPlaceholder
        eyebrow="Скоро"
        title="Управление защитой"
        description="Эти настройки появятся, когда их поддержит сервис идентификации."
        items={["Включение и отключение 2FA через приложение-аутентификатор", "Смена пароля", "Резервные коды"]}
      />
    </>
  );
}
