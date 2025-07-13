import React, { useState, useEffect } from "react";

export default function OrderModal({
  show,
  onClose,
  onSave,
  products = [],
  customers = [],
  defaultValues,
}) {
  const [form, setForm] = useState({
    customer: "",
    items: [],
    status: "Pending",
  });

  useEffect(() => {
    if (defaultValues) setForm(defaultValues);
  }, [defaultValues]);

  const handleItemChange = (index, field, value) => {
    const items = [...form.items];
    items[index][field] = value;
    setForm({ ...form, items });
  };

  const addItem = () => {
    setForm({ ...form, items: [...form.items, { productId: "", quantity: 1 }] });
  };

  const removeItem = (index) => {
    const items = [...form.items];
    items.splice(index, 1);
    setForm({ ...form, items });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.customer || form.items.length === 0)
      return alert("Customer and items are required.");
    onSave(form);
    setForm({ customer: "", items: [], status: "Pending" });
    onClose();
  };

  if (!show) return null;

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            <div className="modal-header">
              <h5 className="modal-title">{defaultValues ? "Edit Order" : "Create Order"}</h5>
              <button type="button" className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Customer</label>
                <select
                  className="form-select"
                  value={form.customer}
                  onChange={(e) => setForm({ ...form, customer: e.target.value })}
                  required
                >
                  <option value="">Select Customer</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  {["Pending", "Shipped", "Delivered", "Cancelled"].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <hr />
              <h6>Items</h6>
              {form.items.map((item, idx) => (
                <div key={idx} className="d-flex gap-2 align-items-center mb-2">
                  <select
                    className="form-select"
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, "productId", e.target.value)}
                    required
                  >
                    <option value="">Product</option>
                    {products.map((p) => (
                      <option key={p._id} value={p._id}>{p.name}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    className="form-control"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(idx, "quantity", e.target.value)}
                    min="1"
                    required
                  />
                  <button type="button" className="btn btn-danger" onClick={() => removeItem(idx)}>✕</button>
                </div>
              ))}
              <button type="button" className="btn btn-outline-secondary" onClick={addItem}>
                + Add Item
              </button>
            </div>
            <div className="modal-footer">
              <button type="submit" className="btn btn-primary">{defaultValues ? "Update" : "Create"}</button>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
