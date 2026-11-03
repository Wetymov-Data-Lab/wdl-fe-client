import { Link } from "react-router-dom";
import { formatIdentityDate, getSessionDevice } from "@/entities/identity/lib/presentation";
import { AccountOverview } from "@/features/account/components/account-overview";
import { SecurityChecklist } from "@/features/account/components/security-checklist";
import { accountSectionEyebrow, accountSectionPath } from "@/features/account/model/account-sections";
import { useAccountOutlet } from "@/pages/account/model/account-outlet-context";

const summaryLimit = 2;

export function OverviewRoute() {
  const { account, sessions, currentSessionId, securitySteps } = useAccountOutlet();

  return (
    <>
      <SecurityChecklist eyebrow={accountSectionEyebrow("overview")} steps={securitySteps} />
      <div className="account-summary-grid">
        <section className="account-summary">
          <header>
            <span>{accountSectionEyebrow("sessions")}</span>
            <Link to={accountSectionPath("sessions")}>Все</Link>
          </header>
          {sessions.slice(0, summaryLimit).map((session) => {
            const device = getSessionDevice(session.user_agent);
            return (
              <div
                className={`account-summary__row${session.id === currentSessionId ? " account-summary__row--current" : ""}`}
                key={session.id}>
                <div>
                  <strong>
                    {device.browser} · {device.platform}
                  </strong>
                  <span>
                    {session.ip} · {formatIdentityDate(session.last_refreshed_at)}
                  </span>
                </div>
                {session.id === currentSessionId && <em>Эта сессия</em>}
              </div>
            );
          })}
        </section>
        <section className="account-summary">
          <header>
            <span>{accountSectionEyebrow("sign-in")}</span>
            <Link to={accountSectionPath("sign-in")}>Все</Link>
          </header>
          {account.identifiers.slice(0, summaryLimit).map((identifier) => (
            <div className="account-summary__row" key={identifier.id}>
              <div>
                <strong className="account-summary__mono">{identifier.value}</strong>
                <span>{identifier.provider ?? identifier.type}</span>
              </div>
              <em className={identifier.is_verified ? undefined : "account-summary__warning"}>
                {identifier.is_verified ? "Подтверждён" : "Не подтверждён"}
              </em>
            </div>
          ))}
        </section>
      </div>
      <AccountOverview account={account} />
    </>
  );
}
