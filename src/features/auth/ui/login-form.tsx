import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { readFormValues } from "@/shared/lib/form-data";
import { FormField } from "@/shared/ui/form-field";
import { AuthSubmitButton } from "@/features/auth/ui/auth-submit-button";

export type LoginValues = {
  email: string;
  password: string;
};

type LoginFormProps = {
  pending: boolean;
  error: string | null;
  onSubmit: (values: LoginValues) => Promise<void>;
};

const fields = ["email", "password"] as const;

export function LoginForm({ pending, error, onSubmit }: LoginFormProps) {
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await onSubmit(readFormValues(event.currentTarget, fields));
  };

  return (
    <form className="access-form" onSubmit={submit}>
      <FormField
        label="Рабочая почта"
        name="email"
        type="email"
        required
        autoComplete="email"
        placeholder="name@company.ru"
      />
      <FormField
        label="Пароль"
        name="password"
        type="password"
        required
        minLength={12}
        maxLength={1024}
        autoComplete="current-password"
        placeholder="Введите пароль"
      />
      {error && (
        <p className="access-error" role="alert">
          {error}
        </p>
      )}
      <AuthSubmitButton pending={pending}>Войти в пространство</AuthSubmitButton>
      <p className="access-switch">
        Нет аккаунта? <Link to="/register">Создать</Link>
      </p>
    </form>
  );
}
