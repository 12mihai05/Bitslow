import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import Market from "./pages/Market";

export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/market" element={<Market />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
export default App;
