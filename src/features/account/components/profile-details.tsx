import { formatIdentityDate, safeProfileUrl } from "@/entities/identity/lib/presentation";
import type { IdentityApi } from "@/shared/api/contracts";
import { CopyButton } from "@/shared/ui/copy-button";
import { AccountSectionHeader } from "@/features/account/components/account-section-header";

type ProfileDetailsProps = { profile: IdentityApi.Profile };

function valueOrDash(value: string | null): string {
  return value || "—";
}

export function ProfileDetails({ profile }: ProfileDetailsProps) {
  const websiteUrl = safeProfileUrl(profile.website_url);
  const details = [
    ["Отображаемое имя", profile.display_name],
    ["Имя", valueOrDash(profile.given_name)],
    ["Фамилия", valueOrDash(profile.family_name)],
    ["Должность", valueOrDash(profile.job_title)],
    ["Организация", valueOrDash(profile.organization)],
    ["Локаль", valueOrDash(profile.locale)],
    ["Часовой пояс", valueOrDash(profile.time_zone)],
    ["Профиль создан", formatIdentityDate(profile.created_at)],
    ["Профиль обновлён", formatIdentityDate(profile.updated_at)],
  ] as const;

  return (
    <section className="account-section profile-details">
      <AccountSectionHeader title="Профиль пользователя" />
      <div className="detail-grid">
        <div className="detail-item detail-item--wide">
          <span>ID профиля</span>
          <div>
            <code>{profile.id}</code>
            <CopyButton value={profile.id} label="ID профиля" />
          </div>
        </div>
        <div className="detail-item detail-item--wide">
          <span>ID аккаунта</span>
          <div>
            <code>{profile.account_id}</code>
            <CopyButton value={profile.account_id} label="ID аккаунта" />
          </div>
        </div>
        {details.map(([label, value]) => (
          <div className="detail-item" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
        <div className="detail-item detail-item--wide">
          <span>О себе</span>
          <p>{valueOrDash(profile.bio)}</p>
        </div>
        <div className="detail-item detail-item--wide">
          <span>Сайт</span>
          {websiteUrl ? (
            <a href={websiteUrl} target="_blank" rel="noreferrer">
              {profile.website_url}
            </a>
          ) : (
            <strong>—</strong>
          )}
        </div>
      </div>
    </section>
  );
}
