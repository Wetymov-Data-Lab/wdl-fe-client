import type { FormEvent } from "react";
import type { IdentityApi } from "@/shared/api/contracts";
import { AccountSectionHeader } from "@/features/account/components/account-section-header";

type ProfileFormProps = {
  profile: IdentityApi.Profile | null;
  pending: boolean;
  saved: boolean;
  error: string | null;
  onSubmit: (profile: IdentityApi.UpdateProfile) => void;
};

type ProfileField = Exclude<keyof IdentityApi.UpdateProfile, "bio">;

const fields: ReadonlyArray<{
  name: ProfileField;
  label: string;
  maxLength: number;
  type?: "text" | "url";
  autoComplete?: string;
  placeholder?: string;
}> = [
  { name: "display_name", label: "Отображаемое имя", maxLength: 255, autoComplete: "name" },
  { name: "given_name", label: "Имя", maxLength: 255, autoComplete: "given-name" },
  { name: "family_name", label: "Фамилия", maxLength: 255, autoComplete: "family-name" },
  { name: "job_title", label: "Должность", maxLength: 255, autoComplete: "organization-title" },
  { name: "organization", label: "Организация", maxLength: 255, autoComplete: "organization" },
  { name: "locale", label: "Локаль", maxLength: 64, placeholder: "ru-RU" },
  { name: "time_zone", label: "Часовой пояс", maxLength: 64, placeholder: "Europe/Moscow" },
  { name: "picture_url", label: "Ссылка на аватар", maxLength: 2048, type: "url", autoComplete: "photo" },
  { name: "website_url", label: "Личный сайт", maxLength: 2048, type: "url", autoComplete: "url" },
];

function optionalValue(form: FormData, name: ProfileField | "bio"): string | null {
  const value = String(form.get(name) ?? "").trim();
  return value || null;
}

export function ProfileForm({ profile, pending, saved, error, onSubmit }: ProfileFormProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    onSubmit({
      display_name: String(form.get("display_name") ?? "").trim(),
      given_name: optionalValue(form, "given_name"),
      family_name: optionalValue(form, "family_name"),
      bio: optionalValue(form, "bio"),
      job_title: optionalValue(form, "job_title"),
      organization: optionalValue(form, "organization"),
      locale: optionalValue(form, "locale"),
      time_zone: optionalValue(form, "time_zone"),
      picture_url: optionalValue(form, "picture_url"),
      website_url: optionalValue(form, "website_url"),
    });
  };

  return (
    <section className="account-section" id="profile">
      <AccountSectionHeader title="Профиль" description="Эти данные видны другим пользователям WDL." />
      <form className="profile-form" key={profile?.updated_at ?? profile?.created_at ?? "new"} onSubmit={submit}>
        <div className="profile-form__grid">
          {fields.map((field) => (
            <label className={field.name.endsWith("_url") ? "profile-form__wide" : undefined} key={field.name}>
              <span>{field.label}</span>
              <input
                name={field.name}
                type={field.type ?? "text"}
                maxLength={field.maxLength}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                defaultValue={profile?.[field.name] ?? ""}
                required={field.name === "display_name"}
              />
            </label>
          ))}
          <label className="profile-form__wide">
            <span>О себе</span>
            <textarea name="bio" maxLength={1000} rows={5} defaultValue={profile?.bio ?? ""} />
          </label>
        </div>
        {error && <p className="profile-form__error">{error}</p>}
        <footer>
          {saved && !pending && <span>Изменения сохранены</span>}
          <button className="button button--primary" type="submit" disabled={pending}>
            {pending ? "Сохраняем…" : "Сохранить профиль"}
          </button>
        </footer>
      </form>
    </section>
  );
}
