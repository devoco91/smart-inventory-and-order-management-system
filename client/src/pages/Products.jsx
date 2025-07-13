// /client/src/pages/Products.jsx
import React, { useState, useEffect, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../utils/api";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({ name: "", sku: "", quantity: "", category: "", image: null });
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [sortField, setSortField] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const fileRef = useRef(null);

  const toast = (msg, color = "#28a745") => {
    Toastify({ text: msg, duration: 3000, gravity: "top", position: "right", backgroundColor: color }).showToast();
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch (err) {
      toast("Failed to load products", "#dc3545");
    }
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, sku, quantity, category, image } = form;
    if (!name || !sku || !quantity || !category)
      return toast("All fields are required", "#ffc107");

    const duplicate = products.find(
      (p) => p.sku === sku && (!editingProduct || p._id !== editingProduct._id)
    );
    if (duplicate) return toast("Duplicate SKU found", "#ffc107");

    try {
      const payload = new FormData();
      payload.append("name", name);
      payload.append("sku", sku);
      payload.append("quantity", quantity);
      payload.append("category", category);
      if (image) payload.append("image", image);

      if (editingProduct) {
        await updateProduct(editingProduct._id, payload);
        toast("Product updated");
      } else {
        await createProduct(payload);
        toast("Product created");
      }

      setForm({ name: "", sku: "", quantity: "", category: "", image: null });
      setEditingProduct(null);
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast("Submit failed", "#dc3545");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setForm({ ...product, image: null });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Delete this product?")) {
      try {
        await deleteProduct(id);
        toast("Product deleted", "#dc3545");
        fetchProducts();
      } catch {
        toast("Delete failed", "#dc3545");
      }
    }
  };

  const exportCSV = () => {
    const csvContent = ["Name,SKU,Quantity,Category",
      ...products.map(p => `${p.name},${p.sku},${p.quantity},${p.category}`)].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "products.csv";
    link.click();
  };

  const importCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const lines = text.trim().split("\n").slice(1);
    for (const line of lines) {
      const [name, sku, quantity, category] = line.split(",");
      if (!name || !sku || !quantity || !category) continue;
      try {
        await createProduct({ name, sku, quantity, category });
      } catch {}
    }
    toast("CSV imported");
    fetchProducts();
    fileRef.current.value = null;
  };

  const sorted = [...products].sort((a, b) => {
    const aVal = a[sortField]?.toString().toLowerCase() || "";
    const bVal = b[sortField]?.toString().toLowerCase() || "";
    return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
  });

  const filtered = sorted.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h2 className="mb-4">Products</h2>
      <div className="d-flex justify-content-between mb-3">
        <input
          type="text"
          className="form-control me-2"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="btn-group">
          <button className="btn btn-outline-secondary" onClick={exportCSV}>Export CSV</button>
          <button className="btn btn-outline-secondary" onClick={() => fileRef.current.click()}>Import CSV</button>
          <input type="file" accept=".csv" ref={fileRef} onChange={importCSV} style={{ display: "none" }} />
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Product</button>
        </div>
      </div>

      <table className="table table-striped">
        <thead className="table-light">
          <tr>
            <th>#</th>
            <th onClick={() => setSortField("name")}>Product</th>
            <th onClick={() => setSortField("sku")}>SKU</th>
            <th onClick={() => setSortField("quantity")}>Qty</th>
            <th onClick={() => setSortField("category")}>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((p, i) => (
            <tr key={p._id}>
              <td>{i + 1}</td>
              <td>{p.name}</td>
              <td>{p.sku}</td>
              <td>{p.quantity} {p.quantity < 5 && <span className="badge bg-danger ms-2">Low</span>}</td>
              <td>{p.category}</td>
              <td>
                <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(p)}>Edit</button>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(p._id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <form onSubmit={handleSubmit}>
                <div className="modal-header">
                  <h5 className="modal-title">{editingProduct ? "Edit Product" : "Add Product"}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body">
                  {["name", "sku", "quantity", "category"].map(field => (
                    <div className="mb-3" key={field}>
                      <label className="form-label text-capitalize">{field}</label>
                      <input
                        type={field === "quantity" ? "number" : "text"}
                        name={field}
                        value={form[field]}
                        onChange={handleChange}
                        className="form-control"
                        required
                      />
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label">Image</label>
                    <input type="file" name="image" className="form-control" onChange={handleChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="submit" className="btn btn-primary">
                    {editingProduct ? "Update" : "Create"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
