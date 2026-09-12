import { useQuery } from "@tanstack/react-query";
import { Link, Navigate, useParams } from "react-router-dom";
import { identityApi, IdentityApiError } from "@/entities/identity/api/identity-api";
import { safeProfileUrl } from "@/entities/identity/lib/presentation";
import { ProfileDetails } from "@/features/account/components/profile-details";
import { useAuth } from "@/features/auth/model/use-auth";

export function ProfilePage() {
  const auth = useAuth();
  const { accountId } = useParams<{ accountId: string }>();
  const profileQuery = useQuery({
    queryKey: ["identity", "profile", accountId],
    queryFn: () => identityApi.profile(accountId!),
    enabled: Boolean(accountId),
  });

  if (accountId === auth.user?.sub) return <Navigate to="/account" replace />;

  if (profileQuery.isLoading) {
    return <main className="account-page account-page--state">Загружаем профиль…</main>;
  }

  if (profileQuery.isError || !profileQuery.data) {
    const notFound = profileQuery.error instanceof IdentityApiError && profileQuery.error.status === 404;
    return (
      <main className="account-page account-page--state">
        <strong>{notFound ? "Профиль не найден" : "Не удалось загрузить профиль"}</strong>
        <Link className="button button--secondary" to="/catalog">
          Вернуться в каталог
        </Link>
      </main>
    );
  }

  const profile = profileQuery.data;
  const subtitle = [profile.job_title, profile.organization].filter(Boolean).join(" · ");
  const pictureUrl = safeProfileUrl(profile.picture_url);

  return (
    <main className="account-page public-profile-page">
      <header className="account-hero">
        <div className="profile-avatar">
          {pictureUrl ? <img src={pictureUrl} alt="" /> : profile.display_name.slice(0, 1).toUpperCase()}
        </div>
        <div className="account-hero__identity">
          <div className="account-hero__name">
            <h1>{profile.display_name}</h1>
          </div>
          {subtitle && <p>{subtitle}</p>}
          <small>Публичный профиль WDL</small>
        </div>
        <Link className="button button--secondary public-profile-page__back" to="/catalog">
          ← К каталогу
        </Link>
      </header>
      <div className="public-profile-page__content">
        <ProfileDetails profile={profile} />
      </div>
    </main>
  );
}
