import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function AdminRoute({ children }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/" replace />;
  if (user.user?.role !== "admin") return <Navigate to="/" replace />;

  return children;
}
