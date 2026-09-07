import type { PropsWithChildren } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { useAuth } from "@/features/auth/model/use-auth";
import { AccountPage } from "@/pages/account/account-page";
import { AuthPage } from "@/pages/auth/auth-page";
import { CatalogPage } from "@/pages/catalog/catalog-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { EditorPage } from "@/pages/editor/editor-page";
import { RealmsPage } from "@/pages/realms/realms-page";
import { AppHeader } from "@/widgets/app-header/ui/app-header";
import "@/App.css";

function ProtectedRoute({ children }: PropsWithChildren) {
  const auth = useAuth();
  const location = useLocation();
  if (import.meta.env.AUTH_ENABLED !== "true") return children;
  if (auth.state === "loading") {
    return (
      <main className="route-loading">
        <span className="loading-ring" />
        Проверяем сессию…
      </main>
    );
  }
  if (auth.state === "anonymous") {
    return <Navigate to="/login" replace state={{ from: `${location.pathname}${location.search}` }} />;
  }
  return children;
}

function Shell() {
  return (
    <div className="app-shell">
      <AppHeader />
      <div className="app-content">
        <Routes>
          <Route path="/overview" element={<DashboardPage />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/realms" element={<RealmsPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/projects" element={<Navigate to="/realms" replace />} />
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage mode="login" />} />
          <Route path="/register" element={<AuthPage mode="register" />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <Shell />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProviders>
  );
}
