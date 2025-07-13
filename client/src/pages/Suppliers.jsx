// /client/src/pages/Suppliers.jsx
import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
} from "../utils/api";

export default function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const fileRef = useRef(null);

  const toast = (msg, color = "#28a745") =>
    Toastify({ text: msg, duration: 3000, gravity: "top", position: "right", backgroundColor: color }).showToast();

  useEffect(() => {
    fetchSuppliers();
  }, [page]);

  const fetchSuppliers = async () => {
    try {
      const res = await getSuppliers({ page, limit });
      setSuppliers(res.data.suppliers || res.data);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || res.data.length);
    } catch (err) {
      console.error("Failed to fetch suppliers", err);
      toast("Failed to fetch suppliers", "#dc3545");
    }
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, phone } = form;
    if (!name || !email || !phone) return toast("All fields required", "#ffc107");

    const duplicate = suppliers.find(
      (s) => (s.email === email || s.phone === phone) &&
      (!editingSupplier || s._id !== editingSupplier._id)
    );
    if (duplicate) return toast("Duplicate email or phone", "#ffc107");

    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier._id, form);
        toast("Supplier updated");
      } else {
        await createSupplier(form);
        toast("Supplier created");
      }
      fetchSuppliers();
      setShowModal(false);
      setEditingSupplier(null);
      setForm({ name: "", email: "", phone: "" });
    } catch (err) {
      console.error("Submit failed", err);
      toast("Submit failed", "#dc3545");
    }
  };

  const handleEdit = (supplier) => {
    setEditingSupplier(supplier);
    setForm(supplier);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this supplier?")) {
      try {
        await deleteSupplier(id);
        toast("Supplier deleted", "#dc3545");
        fetchSuppliers();
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
    const csv = ["Name,Email,Phone", ...filtered.map(s => `${s.name},${s.email},${s.phone}`)].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "suppliers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.trim().split("\n").slice(1);
    for (const line of lines) {
      const [name, email, phone] = line.split(",");
      if (!name || !email || !phone) continue;
      try {
        await createSupplier({ name, email, phone });
      } catch (err) {
        console.warn("Import error:", err);
      }
    }
    toast("CSV import completed");
    fetchSuppliers();
    fileRef.current.value = null;
  };

  const sorted = [...suppliers].sort((a, b) => {
    const aVal = a[sortField]?.toLowerCase() || "";
    const bVal = b[sortField]?.toLowerCase() || "";
    return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const filtered = sorted.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase()) ||
      s.phone.includes(search)
  );

  return (
    <div>
      <h2 className="mb-4">Suppliers</h2>

      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <input
          type="text"
          className="form-control"
          placeholder="Search by name, email or phone"
          style={{ maxWidth: 300 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="file"
          accept=".csv"
          ref={fileRef}
          onChange={importCSV}
          style={{ display: "none" }}
        />
        <div className="btn-group">
          <button className="btn btn-outline-secondary" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-outline-secondary" onClick={() => fileRef.current.click()}>Import CSV</button>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Supplier</button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
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
            {filtered.map((supplier, index) => (
              <tr key={supplier._id || supplier.id}>
                <td>{index + 1}</td>
                <td>{supplier.name}</td>
                <td>{supplier.email}</td>
                <td>{supplier.phone}</td>
                <td>
                  <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(supplier)}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(supplier._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-muted mt-2">
        Showing {suppliers.length} of {totalCount} suppliers
      </div>
      <div className="d-flex justify-content-between align-items-center mt-2">
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
                  <h5 className="modal-title">{editingSupplier ? "Edit Supplier" : "Add Supplier"}</h5>
                  <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditingSupplier(null); }}></button>
                </div>
                <div className="modal-body">
                  {["name", "email", "phone"].map((field) => (
                    <div className="mb-3" key={field}>
                      <label className="form-label text-capitalize">{field}</label>
                      <input
                        type={field === "email" ? "email" : "text"}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setEditingSupplier(null); }}>Cancel</button>
                  <button type="submit" className="btn btn-primary">{editingSupplier ? "Update" : "Create"}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
