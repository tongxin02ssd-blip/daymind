import { Navigate } from "react-router-dom";
import { Loading } from "../components/base/Loading";
import { useAuth } from "../hooks/useAuth";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  if (loading) return <Loading label="正在确认登录状态" />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
