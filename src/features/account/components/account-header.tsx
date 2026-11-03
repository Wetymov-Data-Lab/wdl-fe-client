import type { IdentityApi } from "@/shared/api/contracts";
import { accountStatusLabel, safeProfileUrl } from "@/entities/identity/lib/presentation";
import type { SecurityStep } from "@/entities/identity/lib/security";
import { CopyButton } from "@/shared/ui/copy-button";
import { LogOutIcon } from "@/shared/ui/icons";

type AccountHeaderProps = {
  account: IdentityApi.Account;
  email: string | null;
  securitySteps: SecurityStep[];
  onLogout: () => Promise<void>;
};

const shortDate = new Intl.DateTimeFormat("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });

const statusTone = {
  active: "success",
  pending: "warning",
  deactivated: "danger",
  suspended: "danger",
} satisfies Record<IdentityApi.AccountStatus, "success" | "warning" | "danger">;

function shortId(id: string): string {
  return id.length > 12 ? `${id.slice(0, 4)}...${id.slice(-3)}` : id;
}

export function AccountHeader({ account, email, securitySteps, onLogout }: AccountHeaderProps) {
  const profile = account.profile;
  const name = profile?.display_name ?? email ?? "Пользователь";
  const pictureUrl = safeProfileUrl(profile?.picture_url ?? null);
  const subtitle = [profile?.job_title, profile?.organization].filter(Boolean).join(" · ") || email;
  const doneSteps = securitySteps.filter((step) => step.done).length;
  const securityTone = doneSteps === securitySteps.length ? "success" : "warning";

  return (
    <header className="account-stamp">
      <div className="account-stamp__avatar">
        {pictureUrl ? <img src={pictureUrl} alt="" /> : name.slice(0, 2).toUpperCase()}
      </div>
      <div className="account-stamp__who">
        <h1>{name}</h1>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="account-stamp__cell account-stamp__cell--id">
        <span>ID</span>
        <strong title={account.id}>
          {shortId(account.id)}
          <CopyButton value={account.id} label="ID аккаунта" />
        </strong>
      </div>
      <div className="account-stamp__cell">
        <span>С нами с</span>
        <strong>{shortDate.format(new Date(account.created_at))}</strong>
      </div>
      <div className="account-stamp__cell">
        <span>Статус</span>
        <strong className={`account-stamp__value--${statusTone[account.status]}`}>
          {accountStatusLabel[account.status]}
        </strong>
      </div>
      <div className="account-stamp__cell">
        <span>Защита</span>
        <strong className={`account-stamp__value--${securityTone}`}>
          {doneSteps} / {securitySteps.length}
        </strong>
      </div>
      <button className="account-stamp__logout" type="button" onClick={() => void onLogout()}>
        <LogOutIcon />
        <span>Выход</span>
      </button>
    </header>
  );
}
