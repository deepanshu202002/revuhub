import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, GoogleAuthWrapper } from "./context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <GoogleAuthWrapper>
        <AuthProvider>
          <App />
        </AuthProvider>
      </GoogleAuthWrapper>
    </BrowserRouter>
  </StrictMode>
);
