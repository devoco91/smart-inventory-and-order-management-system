// /client/src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Use environment variable for backend URL
  const API_BASE_URL =
    import.meta.env.VITE_API_URL || "http://localhost:3000/api";

  const toast = (msg, color = "#198754") =>
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: color },
    }).showToast();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // ✅ Use environment-based API URL
      const res = await axios.post(`${API_BASE_URL}/auth/login`, form);
      localStorage.setItem("token", res.data.token);

      // ✅ Fetch current user
      const userRes = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${res.data.token}` },
      });
      localStorage.setItem("user", JSON.stringify(userRes.data));

      toast("Login successful!");
      setError("");
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError("Invalid credentials");
      toast("Invalid credentials", "#dc3545");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3 className="mb-3">Login</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label">Email</label>
          <input
            type="text"
            className="form-control"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            name="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <button type="submit" className="btn btn-primary w-100" disabled={loading}>
          {loading ? (
            <>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
              />
              Logging in...
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>
    </div>
  );
}
