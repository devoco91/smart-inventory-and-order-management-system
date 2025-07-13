import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import BootstrapNavbar from "../components/BootstrapNavbar";
import BootstrapFooter from "../components/BootstrapFooter";

const routeTitles = {
  "/": "Dashboard",
  "/products": "Products",
  "/orders": "Orders",
  "/customers": "Customers",
  "/suppliers": "Suppliers",
  "/scanner": "Barcode Scanner",
  "/users": "User Management",
};

export default function BootstrapLayout() {
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  // Simulate loading (e.g. user fetch delay)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300); // optional: wait 300ms
    return () => clearTimeout(timer);
  }, []);

  // Dynamic page title
  useEffect(() => {
    document.title = routeTitles[location.pathname] || "Smart Inventory";
  }, [location.pathname]);

  return (
    <div className="d-flex flex-column min-vh-100 bg-light">
      <BootstrapNavbar />
      <div className="container my-4 flex-grow-1">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" />
          </div>
        ) : (
          <Outlet />
        )}
      </div>
      <BootstrapFooter />
    </div>
  );
}
