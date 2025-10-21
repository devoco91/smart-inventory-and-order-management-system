import axios from "axios";

// Base API URL (from .env or fallback)
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// =====================================================
// 🔐 AUTH
// =====================================================
export const login = (data) => api.post("/auth/login", data);
export const register = (data) => api.post("/auth/register", data);
export const getCurrentUser = () => api.get("/auth/me");

// =====================================================
// 📦 PRODUCTS
// =====================================================
export const getProducts = () => api.get("/products");
export const createProduct = (data) =>
  api.post("/products", data, {
    headers: {
      "Content-Type":
        data instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
export const updateProduct = (id, data) =>
  api.put(`/products/${id}`, data, {
    headers: {
      "Content-Type":
        data instanceof FormData ? "multipart/form-data" : "application/json",
    },
  });
export const deleteProduct = (id) => api.delete(`/products/${id}`);

// =====================================================
// 🚚 SUPPLIERS
// =====================================================
export const getSuppliers = (params = {}) => api.get("/suppliers", { params });
export const createSupplier = (data) => api.post("/suppliers", data);
export const updateSupplier = (id, data) => api.put(`/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/suppliers/${id}`);

// =====================================================
// 👥 CUSTOMERS
// =====================================================
export const getCustomers = (params = {}) => api.get("/customers", { params });
export const createCustomer = (data) => api.post("/customers", data);
export const updateCustomer = (id, data) => api.put(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// =====================================================
// 🧾 ORDERS
// =====================================================
export const getOrders = (params = {}) => api.get("/orders", { params });
export const createOrder = (data) => api.post("/orders", data);
export const updateOrder = (id, data) => api.put(`/orders/${id}`, data);
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// =====================================================
// 👤 USERS (Admin Only)
// =====================================================
export const getUsers = () => api.get("/users");
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

// =====================================================
// 📊 DASHBOARD STATS
// =====================================================
export const getStatsSummary = () => api.get("/stats/summary");

// =====================================================
// Default export
// =====================================================
export default api;
