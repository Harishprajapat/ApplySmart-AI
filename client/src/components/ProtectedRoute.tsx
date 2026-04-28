import { useEffect, useState } from "react";
import { Navigate } from "@tanstack/react-router";

export default function ProtectedRoute({ children }: any) {
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setIsClient(true);
    const t = localStorage.getItem("token");
    setToken(t);
  }, []);

  // ⛔ Don't render anything on server
  if (!isClient) return null;

  // 🔐 Not logged in → redirect
  if (!token) {
    return <Navigate to="/login" 
    search={{ redirect: window.location.pathname }} 
     />;
  }

  return children;
}