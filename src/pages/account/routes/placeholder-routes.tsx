import { AccountPlaceholder } from "@/features/account/components/account-placeholder";
import { accountSectionEyebrow } from "@/features/account/model/account-sections";

export function InvitationsRoute() {
  return (
    <AccountPlaceholder
      eyebrow={accountSectionEyebrow("invitations")}
      title="Приглашения"
      description="Здесь появятся приглашения в реалмы других пользователей."
      items={["Входящие приглашения с ролью", "Принять или отклонить", "История приглашений"]}
    />
  );
}

export function TokensRoute() {
  return (
    <AccountPlaceholder
      eyebrow={accountSectionEyebrow("tokens")}
      title="Токены API"
      description="Токены для доступа к схемам из CI и скриптов."
      items={["Создание токена с правами", "Срок действия", "Отзыв токена"]}
    />
  );
}

export function DangerRoute() {
  return (
    <AccountPlaceholder
      eyebrow={accountSectionEyebrow("danger")}
      title="Опасная зона"
      description="Необратимые действия с аккаунтом. Каждое будет подтверждаться вводом имени аккаунта."
      items={["Выйти на всех устройствах", "Удалить аккаунт вместе с реалмами, проектами и схемами"]}
    />
  );
}
