import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../utils/api";

export default function BootstrapNavbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    getCurrentUser()
      .then((res) => setUser(res.data))
      .catch(() => setUser(null));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getInitials = (name = "") =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <Link className="navbar-brand" to="/">Smart Inventory</Link>

      <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav">
        <span className="navbar-toggler-icon" />
      </button>

      <div className="collapse navbar-collapse" id="mainNav">
        <ul className="navbar-nav me-auto mb-2 mb-lg-0">
          {[
            { to: "/", label: "Dashboard" },
            { to: "/products", label: "Products" },
            { to: "/orders", label: "Orders" },
            { to: "/customers", label: "Customers" },
            { to: "/suppliers", label: "Suppliers" },
            { to: "/scanner", label: "Scanner" },
            { to: "/users", label: "Users", adminOnly: true },
          ].map(({ to, label, adminOnly }) =>
            !adminOnly || user?.role === "admin" ? (
              <li className="nav-item" key={to}>
                <NavLink to={to} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                  {label}
                </NavLink>
              </li>
            ) : null
          )}
        </ul>

        {user && (
          <div className="dropdown text-end">
            <button
              className="btn btn-sm btn-light dropdown-toggle d-flex align-items-center"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              <div
                className="rounded-circle bg-dark text-white d-flex justify-content-center align-items-center me-2"
                style={{ width: 32, height: 32 }}
                title={user.email}
              >
                {getInitials(user.name)}
              </div>
              <span>{user.name}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end">
              <li><button className="dropdown-item">Profile</button></li>
              <li><hr className="dropdown-divider" /></li>
              <li><button className="dropdown-item text-danger" onClick={logout}>Logout</button></li>
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}
