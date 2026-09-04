import { Link } from "react-router-dom";
import type { IdentityApi } from "@/shared/api/contracts";
import { ArrowRightIcon, CheckIcon } from "@/shared/ui/icons";

type RegistrationSuccessProps = {
  account: IdentityApi.Account;
};

export function RegistrationSuccess({ account }: RegistrationSuccessProps) {
  return (
    <div className="access-success">
      <span className="access-success__mark">
        <CheckIcon />
      </span>
      <p className="access-success__label">ACCOUNT CREATED</p>
      <h3>{account.profile?.display_name}</h3>
      <p>Аккаунт создан и ожидает активации администратором. После активации можно войти с указанной почтой.</p>
      <dl>
        <div>
          <dt>ID</dt>
          <dd>{account.id}</dd>
        </div>
        <div>
          <dt>Статус</dt>
          <dd>{account.status}</dd>
        </div>
      </dl>
      <Link className="access-submit" to="/login">
        <span>Перейти ко входу</span>
        <ArrowRightIcon />
      </Link>
    </div>
  );
}
