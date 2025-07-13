// /client/src/pages/Customers.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { getCustomers, createCustomer, updateCustomer, deleteCustomer } from "../utils/api";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  const toast = (msg, color = "#28a745") => {
    Toastify({ text: msg, duration: 3000, gravity: "top", position: "right", backgroundColor: color }).showToast();
  };

  const fetchCustomers = async () => {
    try {
      const res = await getCustomers({ params: { page, limit } });
      setCustomers(res.data.customers || res.data);
      setTotalPages(res.data.totalPages || 1);
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
    if (!form.name || !form.email || !form.phone) return toast("All fields required", "#ffc107");

    const duplicate = customers.find(c =>
      (c.email === form.email || c.phone === form.phone) &&
      (!editingCustomer || c._id !== editingCustomer._id)
    );
    if (duplicate) return toast("Duplicate email or phone", "#ffc107");

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer._id, form);
        toast("Customer updated");
      } else {
        await createCustomer(form);
        toast("Customer created");
      }
      setShowModal(false);
      setForm({ name: "", email: "", phone: "" });
      setEditingCustomer(null);
      fetchCustomers();
    } catch (err) {
      console.error("Submit failed", err);
      toast("Submit failed", "#dc3545");
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setForm(customer);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this customer?")) {
      try {
        await deleteCustomer(id);
        toast("Customer deleted", "#dc3545");
        fetchCustomers();
      } catch (err) {
        console.error("Delete failed", err);
        toast("Delete failed", "#dc3545");
      }
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const exportCSV = () => {
    const csvContent = ["Name,Email,Phone",
      ...customers.map(c => `${c.name},${c.email},${c.phone}`)
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "customers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const sorted = [...customers].sort((a, b) => {
    const aVal = a[sortField]?.toLowerCase?.() || a[sortField];
    const bVal = b[sortField]?.toLowerCase?.() || b[sortField];
    return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const filtered = sorted.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div>
      <h2 className="mb-4">Customers</h2>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email or phone"
          style={{ maxWidth: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="btn-group">
          <button className="btn btn-outline-secondary" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Customer</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th role="button" onClick={() => handleSort("name")}>Name</th>
              <th role="button" onClick={() => handleSort("email")}>Email</th>
              <th role="button" onClick={() => handleSort("phone")}>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((customer, index) => (
              <tr key={customer._id || customer.id}>
                <td>{index + 1}</td>
                <td>{customer.name}</td>
                <td>{customer.email}</td>
                <td>{customer.phone}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(customer)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(customer._id)}>Delete</button>
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
                  <h5 className="modal-title">{editingCustomer ? "Edit Customer" : "Add Customer"}</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditingCustomer(null); }}></button>
                </div>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Name</label>
                    <input type="text" name="name" value={form.name} onChange={handleChange} className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" required />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input type="text" name="phone" value={form.phone} onChange={handleChange} className="form-control" required />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingCustomer(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingCustomer ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
