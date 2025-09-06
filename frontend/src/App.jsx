import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import CreateReview from "./pages/CreateReview";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";
import AdminRoute from "./components/AdminRoute";
// new pages
import AdminPage from "./pages/AdminPage";
import MyReviewsPage from "./pages/MyReviewPage";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/product/:id" element={<ProductPage />} />

      {/* User Routes */}
      <Route
        path="/create-review"
        element={
          <PrivateRoute>
            <CreateReview />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/my-reviews"
        element={
          <PrivateRoute>
            <MyReviewsPage />
          </PrivateRoute>
        }
      />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />
    </Routes>
  );
}

export default App;
