import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function CustomerModal({ show, onClose, onSave, defaultValues }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  useEffect(() => {
    if (defaultValues) {
      setForm(defaultValues);
    }
  }, [defaultValues]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
    setForm({ name: "", email: "", phone: "" });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{defaultValues ? "Edit Customer" : "Add Customer"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              {["name", "email", "phone"].map((field) => (
                <div className="mb-3" key={field}>
                  <label className="form-label text-capitalize">{field}</label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    className="form-control"
                    name={field}
                    value={form[field]}
                    onChange={handleChange}
                    required
                  />
                </div>
              ))}
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
