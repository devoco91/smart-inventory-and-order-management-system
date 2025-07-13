import React, { useState, useRef } from "react";
import BarcodeScanner from "../components/BarcodeScanner";
import { getProducts, createProduct } from "../utils/api";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

export default function Scanner() {
  const [scannedProduct, setScannedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", quantity: "", category: "" });
  const [history, setHistory] = useState([]);

  const toast = (msg, color = "#28a745") =>
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: color },
    }).showToast();

  const beepAudio = useRef(new Audio("/beep1.mp3"));

  const handleDetected = async (code, format) => {
    beepAudio.current.play();
    const timestamp = new Date().toLocaleTimeString();

    try {
      const res = await getProducts();
      const match = res.data.find((p) => p.sku === code);
      const status = match ? "Found" : "Not Found";

      if (match) {
        setScannedProduct(match);
      } else {
        setForm({ ...form, sku: code });
        setCreating(true);
      }

      setShowModal(true);
      setHistory((prev) => [{ code, format, timestamp, status }, ...prev]);
    } catch (err) {
      console.error("Lookup failed", err);
      toast("Lookup failed", "#dc3545");
    }
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const { name, sku, quantity, category } = form;
    if (!name || !sku || !quantity || !category) return toast("All fields required", "#ffc107");

    try {
      await createProduct({ name, sku, quantity, category });
      toast("Product created");
      setShowModal(false);
      setCreating(false);
      setForm({ name: "", sku: "", quantity: "", category: "" });
    } catch (err) {
      console.error("Create failed", err);
      toast("Create failed", "#dc3545");
    }
  };

  return (
    <div>
      <h2 className="mb-4">Barcode Scanner</h2>
      <BarcodeScanner onDetected={handleDetected} />

      <h5 className="mt-4">Scan History</h5>
      <div className="border rounded p-2 mb-4" style={{ maxHeight: 200, overflowY: "auto" }}>
        {history.length === 0 && <div className="text-muted">No scans yet</div>}
        {history.map((h, i) => (
          <div key={i} className="d-flex justify-content-between">
            <span>{h.timestamp}</span>
            <span>{h.code}</span>
            <span className="text-muted small">{h.format || "?"}</span>
            <span className={`badge ${h.status === "Found" ? "bg-success" : "bg-danger"}`}>{h.status}</span>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal show fade d-block" tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              {!creating ? (
                <>
                  <div className="modal-header">
                    <h5 className="modal-title">Scanned Product</h5>
                    <button className="btn-close" onClick={() => setShowModal(false)}></button>
                  </div>
                  <div className="modal-body">
                    <p><strong>Name:</strong> {scannedProduct.name}</p>
                    <p><strong>SKU:</strong> {scannedProduct.sku}</p>
                    <p><strong>Quantity:</strong> {scannedProduct.quantity}</p>
                    <p><strong>Category:</strong> {scannedProduct.category}</p>
                  </div>
                  <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                  </div>
                </>
              ) : (
                <form onSubmit={handleCreate}>
                  <div className="modal-header">
                    <h5 className="modal-title">Create Product</h5>
                    <button type="button" className="btn-close" onClick={() => { setShowModal(false); setCreating(false); }}></button>
                  </div>
                  <div className="modal-body">
                    {["name", "sku", "quantity", "category"].map((field) => (
                      <div className="mb-3" key={field}>
                        <label className="form-label text-capitalize">{field}</label>
                        <input
                          type={field === "quantity" ? "number" : "text"}
                          name={field}
                          value={form[field]}
                          onChange={handleFormChange}
                          className="form-control"
                          required
                        />
                      </div>
                    ))}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => { setShowModal(false); setCreating(false); }}>Cancel</button>
                    <button type="submit" className="btn btn-primary">Create</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
