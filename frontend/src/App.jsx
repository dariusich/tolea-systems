import { HashRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/a/:slug" element={<Dashboard />} />
        <Route path="/share/:token" element={<Dashboard />} />
        <Route path="/share/:token/a/:slug" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
}

