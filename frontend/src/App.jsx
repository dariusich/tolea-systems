import { HashRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./pages/Dashboard.jsx";
import Home from "./pages/Home.jsx";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/live-results" element={<Dashboard />} />
        <Route path="/live-results/a/:slug" element={<Dashboard />} />
        <Route path="/accounts" element={<Dashboard />} />
        <Route path="/a/:slug" element={<Dashboard />} />
        <Route path="/share/:token" element={<Dashboard />} />
        <Route path="/share/:token/a/:slug" element={<Dashboard />} />
      </Routes>
    </HashRouter>
  );
}
