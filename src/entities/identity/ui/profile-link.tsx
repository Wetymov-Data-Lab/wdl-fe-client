import { Link } from "react-router-dom";

type ProfileLinkProps = {
  accountId: string;
  currentAccountId?: string;
  children?: string;
  className?: string;
};

export function ProfileLink({ accountId, currentAccountId, children, className }: ProfileLinkProps) {
  const isCurrentAccount = accountId === currentAccountId;
  return (
    <Link className={className} to={isCurrentAccount ? "/account" : `/profiles/${accountId}`} title={accountId}>
      {children ?? (isCurrentAccount ? "вы" : accountId)}
    </Link>
  );
}
