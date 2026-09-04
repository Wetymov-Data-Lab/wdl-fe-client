import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/shared/ui/icons";

type CopyButtonProps = {
  value: string;
  label: string;
};

export function CopyButton({ value, label }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1_600);
  };

  return (
    <button
      className="copy-button"
      type="button"
      onClick={copy}
      aria-label={`Скопировать ${label}`}
      title={`Скопировать ${label}`}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </button>
  );
}
