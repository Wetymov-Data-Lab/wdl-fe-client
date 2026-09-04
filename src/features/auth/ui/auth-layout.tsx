import type { PropsWithChildren } from "react";
import { ProductBrand } from "@/shared/ui/product-brand";

type AuthLayoutProps = PropsWithChildren<{
  title: string;
  description: string;
}>;

export function AuthLayout({ title, description, children }: AuthLayoutProps) {
  return (
    <main className="access-page">
      <header className="access-header">
        <ProductBrand />
        <span>WDL / IDENTITY</span>
      </header>

      <div className="access-layout">
        <aside className="access-intro">
          <p className="access-index">01 — ACCOUNT</p>
          <h1>Проектировка диаграмм БД.</h1>
          <p>{description}</p>
          <dl className="access-service">
            <div>
              <dt>Сервис</dt>
              <dd>Identity</dd>
            </div>
            <div>
              <dt>Сессия</dt>
              <dd>OAuth 2.0</dd>
            </div>
            <div>
              <dt>Статус</dt>
              <dd>
                <i /> Доступен
              </dd>
            </div>
          </dl>
        </aside>

        <section className="access-workspace">
          <div className="access-form-frame">
            <header>
              <span>Авторизация</span>
              <h2>{title}</h2>
            </header>
            {children}
          </div>
        </section>
      </div>

      <footer className="access-footer">
        <span>© {new Date().getFullYear()} Wetymov Data Labs</span>
        <span>Безопасное подключение</span>
      </footer>
    </main>
  );
}
