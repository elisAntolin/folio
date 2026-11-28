import { useEffect, useSyncExternalStore } from "react";
import { Navigate, Outlet, Routes, Route, useLocation } from "react-router";
import HomePage from "./pages/HomePage/HomePage";
import EditorPage from "./pages/EditorPage/EditorPage";
import SharedEditorPage from "./pages/EditorPage/SharedEditorPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import { getSession, subscribeSession } from "./session";

function RequireSession() {
  const location = useLocation();
  const session = useSyncExternalStore(subscribeSession, getSession);
  const returnTo = location.pathname + location.search + location.hash;
  return session ? <Outlet key={session.id} /> : <Navigate replace to="/login" state={{ returnTo }} />;
}

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <Routes>
      <Route path="/login" element={<AuthPage key="login" mode="login" />} />
      <Route path="/cadastro" element={<AuthPage key="signup" mode="signup" />} />
      <Route path="/recuperar-senha" element={<AuthPage key="recovery" mode="recovery" />} />
      <Route path="/shared/:token" element={<SharedEditorPage />} />
      <Route element={<RequireSession />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/pages/:id" element={<EditorPage />} />
      </Route>
    </Routes>
  );
}

export default App;
