import { formatIdentityDate } from "@/entities/identity/lib/presentation";
import type { IdentityApi } from "@/shared/api/contracts";
import { CopyButton } from "@/shared/ui/copy-button";
import { AccountSectionHeader } from "@/features/account/components/account-section-header";

type AccountOverviewProps = { account: IdentityApi.Account };
// TODO: Посмотреть подключение 2FA
export function AccountOverview({ account }: AccountOverviewProps) {
  const profile = account.profile;
  const details = [
    ["Создан", formatIdentityDate(account.created_at)],
    ["Последняя активность", formatIdentityDate(account.last_active_at)],
    ["Локаль", profile?.locale ?? "—"],
    ["Часовой пояс", profile?.time_zone ?? "—"],
  ] as const;

  return (
    <section className="account-section" id="overview">
      <AccountSectionHeader title="Об аккаунте" />
      <div className="detail-grid">
        <div className="detail-item detail-item--wide">
          <span>ID аккаунта</span>
          <div>
            <code>{account.id}</code>
            <CopyButton value={account.id} label="ID аккаунта" />
          </div>
        </div>
        {details.map(([label, value]) => (
          <div className="detail-item" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      {/* <div className="security-note">
        <ShieldIcon />
        <div>
          <strong>Двухфакторная защита</strong>
          <p>{account.is_2fa_enforced ? "Обязательна для этого аккаунта" : "Сейчас не требуется для входа"}</p>
        </div>
        <span className={account.is_2fa_enforced ? "enabled" : "disabled"}>
          {account.is_2fa_enforced ? "Включена" : "Не включена"}
        </span>
      </div> */}
    </section>
  );
}
