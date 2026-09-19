import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "../hooks/auth";
import {
  Layout,
  Dashboard,
  Expenses,
  Income,
  Categories,
  Budgets,
  Recurring,
  Analytics,
} from "../pages/AppPages";
import { ProfilePage } from "../pages/ProfilePage";
import { Login, Register } from "../pages/Auth";
import { Spinner } from "../components/ui";
function Protected() {
  const { user, loading } = useAuth();
  if (loading) return <Spinner />;
  return user ? <Layout /> : <Navigate to="/login" replace />;
}
export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<Protected />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/income" element={<Income />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/budgets" element={<Budgets />} />
            <Route path="/recurring-transactions" element={<Recurring />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
