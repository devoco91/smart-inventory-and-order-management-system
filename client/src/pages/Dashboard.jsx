// /client/src/pages/Dashboard.jsx
import React, { useEffect, useState, useRef } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { Button, Form } from "react-bootstrap";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import {
  getProducts,
  updateProduct,
  getStatsSummary,
} from "../utils/api";

export default function Dashboard() {
  const [stats, setStats] = useState({
    productCount: 0,
    orderCount: 0,
    lowStockCount: 0,
    recentSales: [],
  });
  const [latestProducts, setLatestProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [editingStock, setEditingStock] = useState({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const reportRef = useRef();

  useEffect(() => {
    const fetchStats = async () => {
      setLoadingStats(true);
      const res = await getStatsSummary();
      setStats(res.data);
      setLoadingStats(false);
    };

    const fetchProducts = async () => {
      setLoadingProducts(true);
      const res = await getProducts();
      setLatestProducts(res.data.reverse());
      setLoadingProducts(false);
    };

    fetchStats();
    fetchProducts();
  }, []);

  const handleStockChange = (id, value) => {
    setEditingStock({ ...editingStock, [id]: value });
  };

  const handleStockSave = async (product) => {
    const updated = {
      ...product,
      quantity: parseInt(editingStock[product._id] || product.quantity),
    };
    await updateProduct(product._id, updated);
    const res = await getProducts();
    setLatestProducts(res.data.reverse());
    setEditingStock((prev) => ({ ...prev, [product._id]: "" }));
  };

  const filteredProducts = latestProducts
    .filter((p) => p.name.toLowerCase().includes(search.toLowerCase()))
    .slice(0, 5);

  const salesData = stats.recentSales.map((s) => ({
    month: `Month ${s._id}`,
    sales: s.totalSales,
  }));

  const csvData = [
    ["Month", "Sales"],
    ...salesData.map((s) => [s.month, s.sales]),
  ];

  const exportPDF = async () => {
    const canvas = await html2canvas(reportRef.current);
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 10, width, height);
    pdf.save("dashboard-report.pdf");
  };

  const productChartData = Object.values(
    latestProducts.reduce((acc, p) => {
      acc[p.category] = acc[p.category] || { category: p.category, count: 0 };
      acc[p.category].count += 1;
      return acc;
    }, {})
  );

  return (
    <div>
      <h2 className="mb-4">Dashboard</h2>

      {loadingStats ? (
        <div className="text-center py-5">Loading stats...</div>
      ) : (
        <div className="row mb-4" ref={reportRef}>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Total Products</h5>
                <p className="card-text h4">{stats.productCount}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Orders This Month</h5>
                <p className="card-text h4">{stats.orderCount}</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow-sm">
              <div className="card-body">
                <h5 className="card-title">Low Stock Alerts</h5>
                <p className="card-text h4 text-danger">{stats.lowStockCount}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="card shadow-sm mb-3">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title">Monthly Sales Report</h5>
            <div>
              <CSVLink
                data={csvData}
                filename="monthly-sales.csv"
                className="btn btn-outline-primary btn-sm me-2"
              >
                Export CSV
              </CSVLink>
              <Button onClick={exportPDF} variant="outline-danger" size="sm">
                Export PDF
              </Button>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData} margin={{ top: 20, right: 30, bottom: 10, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#0d6efd" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <h5 className="card-title">Products Per Category</h5>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={productChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#198754" name="Product Count" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <h5 className="card-title">Recent Products</h5>
            <Form.Control
              type="text"
              placeholder="Search by name"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: 200 }}
              size="sm"
            />
          </div>

          {loadingProducts ? (
            <div className="text-center p-4">Loading products...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-sm table-striped">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>SKU</th>
                    <th>Qty</th>
                    <th>Category</th>
                    <th>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => (
                    <tr key={p._id} className={p.quantity < 5 ? "table-danger" : ""}>
                      <td>
                        {p.image ? (
                          <img src={`http://localhost:5000/uploads/${p.image}`} alt={p.name} width="40" />
                        ) : (
                          <span className="text-muted">No image</span>
                        )}
                      </td>
                      <td>{p.name}</td>
                      <td>{p.sku}</td>
                      <td>
                        <Form.Control
                          type="number"
                          size="sm"
                          value={editingStock[p._id] ?? p.quantity}
                          onChange={(e) => handleStockChange(p._id, e.target.value)}
                          style={{ width: 80 }}
                        />
                      </td>
                      <td>{p.category}</td>
                      <td>
                        <Button size="sm" variant="success" onClick={() => handleStockSave(p)}>
                          Save
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
