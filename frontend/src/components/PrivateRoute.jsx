import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : alert("Please Login") && <Navigate to="/" replace />;
}
