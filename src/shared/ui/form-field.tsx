import type { InputHTMLAttributes, ReactNode } from "react";

type FormFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  hint?: ReactNode;
};

export function FormField({ label, hint, ...inputProps }: FormFieldProps) {
  return (
    <label className="form-field">
      <span className="form-field__label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <input className="form-field__control" {...inputProps} />
    </label>
  );
}
