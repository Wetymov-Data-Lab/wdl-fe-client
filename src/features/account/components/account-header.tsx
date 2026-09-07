import type { IdentityApi } from "@/shared/api/contracts";
import { accountStatusLabel } from "@/entities/identity/lib/presentation";
import { LogOutIcon } from "@/shared/ui/icons";

type AccountHeaderProps = {
  account: IdentityApi.Account;
  email: string | null;
  onLogout: () => Promise<void>;
};

export function AccountHeader({ account, email, onLogout }: AccountHeaderProps) {
  const profile = account.profile;
  const name = profile?.display_name ?? email ?? "Пользователь";

  return (
    <header className="account-hero">
      <div className="profile-avatar">
        {profile?.picture_url ? <img src={profile.picture_url} alt="" /> : name.slice(0, 1).toUpperCase()}
      </div>
      <div className="account-hero__identity">
        <div className="account-hero__name">
          <h1>{name}</h1>
          <span className={`status-pill status-pill--${account.status}`}>{accountStatusLabel[account.status]}</span>
        </div>
        <p>{email}</p>
        {(profile?.job_title || profile?.organization) && (
          <small>{[profile.job_title, profile.organization].filter(Boolean).join(" · ")}</small>
        )}
      </div>
      <button className="account-logout" type="button" onClick={() => void onLogout()}>
        <LogOutIcon />
        <span>Выход</span>
      </button>
    </header>
  );
}
