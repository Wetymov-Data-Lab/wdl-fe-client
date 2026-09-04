import { IdentityApiError } from "@/entities/identity/api/identity-api";

export function toAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message === "PASSWORDS_DO_NOT_MATCH") return "Пароли не совпадают.";
  if (error instanceof DOMException && error.name === "AbortError") {
    return "Сервис не ответил вовремя. Попробуйте ещё раз.";
  }
  if (error instanceof TypeError) return "Не удалось подключиться к сервису авторизации.";
  if (error instanceof IdentityApiError) {
    const knownErrors = {
      401: "Неверная почта или пароль.",
      403: "Аккаунт ещё не активирован или доступ ограничен.",
      409: "Аккаунт с такой почтой уже существует.",
    } satisfies Partial<Record<number, string>>;

    return knownErrors[error.status as keyof typeof knownErrors] ?? error.message;
  }
  return "Что-то пошло не так. Попробуйте ещё раз.";
}
