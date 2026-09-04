import { ArrowRightIcon } from "@/shared/ui/icons";

type AuthSubmitButtonProps = {
  pending: boolean;
  children: string;
};

export function AuthSubmitButton({ pending, children }: AuthSubmitButtonProps) {
  return (
    <button className="access-submit" type="submit" disabled={pending}>
      <span>{pending ? "Отправка…" : children}</span>
      {!pending && <ArrowRightIcon />}
    </button>
  );
}
