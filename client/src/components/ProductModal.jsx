// /client/src/components/ProductModal.jsx
import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function ProductModal({ show, onClose, onSave, defaultValues }) {
  const [form, setForm] = useState({
    name: "",
    sku: "",
    quantity: "",
    category: "",
    image: null,
  });

  useEffect(() => {
    if (defaultValues) {
      setForm({ ...defaultValues, image: null });
    }
  }, [defaultValues]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setForm({ ...form, image: files[0] });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm({ name: "", sku: "", quantity: "", category: "", image: null });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1" role="dialog">
      <div className="modal-dialog" role="document">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{defaultValues ? "Edit Product" : "Add Product"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {["name", "sku", "quantity", "category"].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label text-capitalize">{field}</label>
                  <input
                    type={field === "quantity" ? "number" : "text"}
                    className="form-control"
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
              <div className="mb-3">
                <label className="form-label">Product Image</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">
                {defaultValues ? "Update" : "Save"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
