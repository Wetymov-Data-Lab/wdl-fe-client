import { NavLink } from "react-router-dom";
import { useAuth } from "@/features/auth/model/use-auth";
import { ProductBrand } from "@/shared/ui/product-brand";

const navigation = [
  { index: "01", label: "Пространства", to: "/realms" },
  { index: "02", label: "Редактор схем", to: "/editor" },
] as const;

export function AppHeader() {
  const auth = useAuth();
  const name = auth.user?.name ?? auth.user?.email ?? "Локальный режим";

  return (
    <header className="app-header">
      <div className="app-header__brand">
        <ProductBrand to="/editor" />
      </div>
      <nav className="app-header__nav" aria-label="Основная навигация">
        {navigation.map((item) => (
          <NavLink to={item.to} className="nav-link" key={item.to}>
            <small>{item.index}</small>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <NavLink className="account-trigger" to={auth.user ? "/account" : "/login"}>
        <span className="account-trigger__status" aria-hidden="true" />
        <span className="account-trigger__copy">
          <small>{auth.user ? "ACCOUNT" : "LOCAL"}</small>
          <strong>{name}</strong>
        </span>
        <span className="account-trigger__avatar">{name.slice(0, 1).toUpperCase()}</span>
        <span className="account-trigger__arrow">↗</span>
      </NavLink>
    </header>
  );
}
