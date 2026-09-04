import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { AuthSubmitButton } from "@/features/auth/ui/auth-submit-button";
import { readFormValues } from "@/shared/lib/form-data";
import { FormField } from "@/shared/ui/form-field";

export type RegistrationValues = {
  displayName: string;
  givenName: string;
  familyName: string;
  email: string;
  password: string;
  passwordConfirm: string;
};

type RegistrationFormProps = {
  pending: boolean;
  error: string | null;
  onSubmit: (values: RegistrationValues) => Promise<void>;
};

const fields = ["displayName", "givenName", "familyName", "email", "password", "passwordConfirm"] as const;

export function RegistrationForm({ pending, error, onSubmit }: RegistrationFormProps) {
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(readFormValues(event.currentTarget, fields));
  };

  return (
    <form className="access-form" onSubmit={submit}>
      <FormField
        label="Отображаемое имя"
        name="displayName"
        required
        maxLength={255}
        autoComplete="name"
        placeholder="Иван Петров"
      />
      <div className="access-form__row">
        <FormField label="Имя" hint="необязательно" name="givenName" maxLength={255} autoComplete="given-name" />
        <FormField label="Фамилия" hint="необязательно" name="familyName" maxLength={255} autoComplete="family-name" />
      </div>
      <FormField
        label="Рабочая почта"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="name@company.ru"
      />
      <div className="access-form__row">
        <FormField
          label="Пароль"
          hint="от 12 символов"
          name="password"
          type="password"
          required
          minLength={12}
          maxLength={1024}
          autoComplete="new-password"
        />
        <FormField
          label="Повторите пароль"
          name="passwordConfirm"
          type="password"
          required
          minLength={12}
          maxLength={1024}
          autoComplete="new-password"
        />
      </div>
      {error && (
        <p className="access-error" role="alert">
          {error}
        </p>
      )}
      <AuthSubmitButton pending={pending}>Создать аккаунт</AuthSubmitButton>
      <p className="access-switch">
        Уже зарегистрированы? <Link to="/login">Войти</Link>
      </p>
    </form>
  );
}
