import { Link } from "react-router-dom";
import type { SecurityStep } from "@/entities/identity/lib/security";
import { accountSectionPath, type AccountSectionId } from "@/features/account/model/account-sections";
import { AccountSectionHeader } from "@/features/account/components/account-section-header";

type SecurityChecklistProps = {
  eyebrow: string;
  steps: SecurityStep[];
};

const stepActions: Record<SecurityStep["id"], { label: string; section: AccountSectionId }> = {
  "verified-email": { label: "Подтвердить", section: "sign-in" },
  "second-sign-in": { label: "Добавить", section: "sign-in" },
  "two-factor": { label: "Подробнее", section: "security" },
  "stale-sessions": { label: "К сессиям", section: "sessions" },
};

export function SecurityChecklist({ eyebrow, steps }: SecurityChecklistProps) {
  const done = steps.filter((step) => step.done).length;
  const left = steps.length - done;

  return (
    <section className="account-section security-checklist">
      <AccountSectionHeader
        eyebrow={eyebrow}
        title={left ? `Осталось шагов: ${left}` : "Аккаунт защищён"}
        description={`Выполнено ${done} из ${steps.length}`}
      />
      <div className="security-checklist__meter" aria-hidden="true">
        {steps.map((step) => (
          <span className={step.done ? "is-done" : undefined} key={step.id} />
        ))}
      </div>
      {steps.map((step) => {
        const action = stepActions[step.id];
        return (
          <div className={step.done ? "security-step" : "security-step security-step--todo"} key={step.id}>
            <span className="security-step__mark" aria-hidden="true">
              {step.done ? "OK" : "!"}
            </span>
            <div>
              <strong>{step.label}</strong>
              <span>{step.detail}</span>
            </div>
            {step.done ? (
              <span className="security-step__status">Готово</span>
            ) : (
              <Link className="button button--sm" to={accountSectionPath(action.section)}>
                {action.label}
              </Link>
            )}
          </div>
        );
      })}
    </section>
  );
}
