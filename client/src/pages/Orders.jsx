// /client/src/pages/Orders.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getOrders, createOrder, updateOrder, deleteOrder, getCustomers } from "../utils/api";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [form, setForm] = useState({ customer: "", date: "", status: "Pending", total: "" });
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchOrders();
    fetchCustomers();
  }, [page]);

  const toast = (msg, color = "#28a745") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: color }
    }).showToast();
  };

  const fetchOrders = async () => {
    try {
      const res = await getOrders({ params: { page, limit } });
      setOrders(res.data.orders || res.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      console.error("Failed to load orders", err);
      toast("Failed to load orders", "#dc3545");
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers();
      setCustomers(res.data.customers || res.data || []);
    } catch (err) {
      console.error("Failed to load customers", err);
      toast("Failed to load customers", "#dc3545");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer || !form.date || !form.status || !form.total)
      return toast("All fields are required", "#ffc107");

    try {
      if (editingOrder) {
        await updateOrder(editingOrder._id, form);
        toast("Order updated");
      } else {
        await createOrder(form);
        toast("Order created");
      }
      setShowModal(false);
      setForm({ customer: "", date: "", status: "Pending", total: "" });
      setEditingOrder(null);
      fetchOrders();
    } catch (err) {
      console.error("Failed to submit order", err);
      toast("Submission failed", "#dc3545");
    }
  };

  const handleEdit = (order) => {
    setEditingOrder(order);
    setForm(order);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await deleteOrder(id);
        fetchOrders();
        toast("Order deleted", "#dc3545");
      } catch (err) {
        console.error("Failed to delete order", err);
        toast("Delete failed", "#dc3545");
      }
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "badge bg-warning text-dark";
      case "Shipped": return "badge bg-info text-dark";
      case "Delivered": return "badge bg-success";
      case "Cancelled": return "badge bg-danger";
      default: return "badge bg-secondary";
    }
  };

  const getCustomerName = (customer) => {
  if (!customer) return "Unknown";
  if (typeof customer === "object" && customer.name) return customer.name;
  const found = customers.find((c) => c._id === customer);
  return found?.name || "Unknown";
};


  const filteredOrders = orders
    .filter((o) => !statusFilter || o.status === statusFilter)
    .filter((o) => {
      const customerName = getCustomerName(o.customer);
      const searchTarget = typeof customerName === "string" ? customerName.toLowerCase() : "";
      return searchTarget.includes(searchTerm.toLowerCase()) || o._id.includes(searchTerm);
    });

  return (
    <div>
      <h2 className="mb-4">Orders</h2>

      <div className="d-flex justify-content-between align-items-center mb-3 gap-3 flex-wrap">
        <div className="d-flex gap-2">
          <select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Shipped">Shipped</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled</option>
          </select>
          <input
            type="text"
            placeholder="Search customer or ID"
            className="form-control"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Order
        </button>
      </div>

      <div className="table-responsive">
        <table className="table table-hover">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total ($)</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order, index) => (
              <tr key={order._id}>
                <td>{index + 1}</td>
                <td>{getCustomerName(order.customer)}</td>
                <td>{order.date}</td>
                <td><span className={getStatusClass(order.status)}>{order.status}</span></td>
                <td>{parseFloat(order.total).toFixed(2)}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleEdit(order)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(order._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-between align-items-center mt-3">
        <span>Page {page} of {totalPages}</span>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page === 1} onClick={() => setPage(page - 1)}>Prev</button>
          <button className="btn btn-outline-secondary" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</button>
        </div>
      </div>

      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingOrder ? "Edit Order" : "Add Order"}</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditingOrder(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Customer</label>
                    <select className="form-select" name="customer" value={form.customer} onChange={handleChange} required>
                      <option value="">Select Customer</option>
                      {customers.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" name="date" value={form.date} onChange={handleChange} required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Status</label>
                    <select className="form-select" name="status" value={form.status} onChange={handleChange} required>
                      <option>Pending</option>
                      <option>Shipped</option>
                      <option>Delivered</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Total ($)</label>
                    <input type="number" className="form-control" name="total" value={form.total} onChange={handleChange} step="0.01" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingOrder(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingOrder ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
