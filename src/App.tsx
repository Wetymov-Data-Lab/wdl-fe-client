import type { PropsWithChildren } from "react";
import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { useAuth } from "@/features/auth/model/use-auth";
import { AccountPage } from "@/pages/account/account-page";
import { OverviewRoute } from "@/pages/account/routes/overview-route";
import { DangerRoute, InvitationsRoute, TokensRoute } from "@/pages/account/routes/placeholder-routes";
import { PreferencesRoute } from "@/pages/account/routes/preferences-route";
import { ProfileRoute } from "@/pages/account/routes/profile-route";
import { RealmsRoute } from "@/pages/account/routes/realms-route";
import { SecurityRoute } from "@/pages/account/routes/security-route";
import { SessionsRoute } from "@/pages/account/routes/sessions-route";
import { SignInRoute } from "@/pages/account/routes/sign-in-route";
import { AuthPage } from "@/pages/auth/auth-page";
import { CatalogPage } from "@/pages/catalog/catalog-page";
import { DashboardPage } from "@/pages/dashboard/dashboard-page";
import { EditorPage } from "@/pages/editor/editor-page";
import { RealmsPage } from "@/pages/realms/realms-page";
import { ProfilePage } from "@/pages/profile/profile-page";
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
          <Route path="/account" element={<AccountPage />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<OverviewRoute />} />
            <Route path="profile" element={<ProfileRoute />} />
            <Route path="sign-in" element={<SignInRoute />} />
            <Route path="security" element={<SecurityRoute />} />
            <Route path="sessions" element={<SessionsRoute />} />
            <Route path="realms" element={<RealmsRoute />} />
            <Route path="invitations" element={<InvitationsRoute />} />
            <Route path="preferences" element={<PreferencesRoute />} />
            <Route path="tokens" element={<TokensRoute />} />
            <Route path="danger" element={<DangerRoute />} />
            <Route path="*" element={<Navigate to="overview" replace />} />
          </Route>
          <Route path="/profiles/:accountId" element={<ProfilePage />} />
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
