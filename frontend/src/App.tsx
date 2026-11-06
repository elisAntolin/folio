import { Routes, Route } from "react-router";
import HomePage from "./pages/HomePage/HomePage";
import EditorPage from "./pages/EditorPage/EditorPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/pages/:id" element={<EditorPage />} />
    </Routes>
  );
}

export default App;
