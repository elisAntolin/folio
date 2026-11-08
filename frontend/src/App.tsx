import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import HomePage from "./pages/HomePage/HomePage";
import EditorPage from "./pages/EditorPage/EditorPage";

function App() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pages/:id" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
