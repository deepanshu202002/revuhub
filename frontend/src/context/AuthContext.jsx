import { createContext, useContext, useEffect } from "react";

import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { useState } from "react";

const AuthCtx = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("revuhub_auth");
    return raw ? JSON.parse(raw) : null;
  });

  const loginWithGoogleToken = async (googleToken) => {
    const res = await fetch("http://localhost:4000" + "/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tokenId: googleToken }),
    });
    const data = await res.json();
    if (data.token) {
      const decoded = jwtDecode(data.token);
      const auth = { token: data.token, user: data.user, decoded };
      localStorage.setItem("revuhub_auth", JSON.stringify(auth));
      setUser(auth);
    }
  };
  const logout = () => {
    localStorage.removeItem("revuhub_auth");
    setUser(null);
  };

  return (
    <AuthCtx.Provider value={{ user, setUser, loginWithGoogleToken, logout }}>
      {children}
    </AuthCtx.Provider>
  );
}

export function useAuth() {
  return useContext(AuthCtx);
}

export function GoogleAuthWrapper({ children }) {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      {children}
    </GoogleOAuthProvider>
  );
}

export function GoogleButton() {
  const { loginWithGoogleToken } = useAuth();
  return (
    <GoogleLogin
      onSuccess={(cred) => loginWithGoogleToken(cred.credential)}
      onError={() => alert("Google login failed")}
    />
  );
}
