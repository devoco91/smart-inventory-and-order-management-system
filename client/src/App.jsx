// /client/src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import BootstrapLayout from "./Layout/BootstrapLayout";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Customers from "./pages/Customers";
import Suppliers from "./pages/Suppliers";
import Scanner from "./pages/Scanner";
import Login from "./pages/Login";
import Users from "./pages/Users";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <BootstrapLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="orders" element={<Orders />} />
          <Route path="customers" element={<Customers />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="scanner" element={<Scanner />} />
          <Route
            path="users"
            element={
              <ProtectedRoute role="admin">
                <Users />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<div className="p-4">404 - Page not found</div>} />
      </Routes>
    </BrowserRouter>
  );
}
