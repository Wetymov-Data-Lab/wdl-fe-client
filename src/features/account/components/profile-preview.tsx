import type { IdentityApi } from "@/shared/api/contracts";
import { safeProfileUrl } from "@/entities/identity/lib/presentation";

type ProfilePreviewProps = {
  profile: IdentityApi.UpdateProfile;
};

export function ProfilePreview({ profile }: ProfilePreviewProps) {
  const name = profile.display_name || "Без имени";
  const pictureUrl = safeProfileUrl(profile.picture_url);
  const subtitle = [profile.job_title, profile.organization].filter(Boolean).join(" · ");
  const facts = [
    ["Часовой пояс", profile.time_zone],
    ["Локаль", profile.locale],
    ["Сайт", profile.website_url],
  ].filter((fact): fact is [string, string] => Boolean(fact[1]));

  return (
    <aside className="profile-preview" aria-label="Предпросмотр публичного профиля">
      <span className="profile-preview__eyebrow">Так вас видят другие</span>
      <div className="profile-preview__head">
        <span className="profile-preview__avatar">
          {pictureUrl ? <img src={pictureUrl} alt="" /> : name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <strong>{name}</strong>
          {subtitle && <span>{subtitle}</span>}
        </div>
      </div>
      {profile.bio && <p>{profile.bio}</p>}
      {facts.length > 0 && (
        <dl>
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt>{label}</dt>
              <dd>{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </aside>
  );
}
