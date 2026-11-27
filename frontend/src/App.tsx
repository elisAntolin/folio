import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import HomePage from "./pages/HomePage/HomePage";
import EditorPage from "./pages/EditorPage/EditorPage";
import SharedEditorPage from "./pages/EditorPage/SharedEditorPage";
import AuthPage from "./pages/AuthPage/AuthPage";

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
      <Route path="/" element={<HomePage />} />
      <Route path="/shared/:token" element={<SharedEditorPage />} />
      <Route path="/pages/:id" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
