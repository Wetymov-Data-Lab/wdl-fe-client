import type { IdentityApi } from "@/shared/api/contracts";
import { accountStatusLabel, safeProfileUrl } from "@/entities/identity/lib/presentation";
import { LogOutIcon, PencilIcon } from "@/shared/ui/icons";

type AccountHeaderProps = {
  account: IdentityApi.Account;
  email: string | null;
  onLogout: () => Promise<void>;
};

export function AccountHeader({ account, email, onLogout }: AccountHeaderProps) {
  const profile = account.profile;
  const name = profile?.display_name ?? email ?? "Пользователь";
  const pictureUrl = safeProfileUrl(profile?.picture_url ?? null);

  return (
    <header className="account-hero">
      <div className="profile-avatar profile-avatar--editable" title="Загрузка аватара появится позже">
        {pictureUrl ? <img src={pictureUrl} alt="" /> : name.slice(0, 1).toUpperCase()}
        <span className="profile-avatar__edit" aria-hidden="true">
          <PencilIcon />
        </span>
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
