import { Link } from "react-router-dom";

type ProductBrandProps = {
  to?: string;
  tone?: "default" | "muted";
  compact?: boolean;
};

export function ProductBrand({ to = "/", tone = "default", compact = false }: ProductBrandProps) {
  const className = ["product-brand", `product-brand--${tone}`, compact && "product-brand--compact"]
    .filter(Boolean)
    .join(" ");

  return (
    <Link className={className} to={to} aria-label="WDL — Wetymov Data Labs">
      <img className="product-brand__mark" src="/logo.svg" alt="" />
      <span className="product-brand__copy">
        <strong>WDL</strong>
        {!compact && <small>Wetymov Data Labs</small>}
      </span>
    </Link>
  );
}
