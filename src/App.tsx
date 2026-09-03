import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import { AppProviders } from "@/app/providers";
import { EditorPage } from "@/pages/editor/editor-page";
import { RealmsPage } from "@/pages/realms/realms-page";
import "@/App.css";

function Shell() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <NavLink to="/editor" className="brand" aria-label="WDL - редактор схем">
          <img className="brand__mark" src="/logo.svg" alt="" />
          <span className="brand__copy">
            <strong>WDL</strong>
            <small>Wetymov Data Labs</small>
          </span>
        </NavLink>
        <nav className="app-header__nav" aria-label="Основная навигация">
          <NavLink to="/realms" className="nav-link">
            <span className="nav-link__label">Пространства</span>
          </NavLink>
          <NavLink to="/editor" className="nav-link">
            <span className="nav-link__label">Редактор схем</span>
          </NavLink>
        </nav>
        <div className="app-header__mode">
          <span className="avatar">D</span>
          <span>
            <b>Локальный режим</b>
            <small>без авторизации</small>
          </span>
        </div>
      </header>
      <main className="app-content">
        <Routes>
          <Route path="/editor" element={<EditorPage />} />
          <Route path="/realms" element={<RealmsPage />} />
          <Route path="/projects" element={<Navigate to="/realms" replace />} />
          <Route path="*" element={<Navigate to="/editor" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AppProviders>
      <BrowserRouter>
        <Shell />
      </BrowserRouter>
    </AppProviders>
  );
}
