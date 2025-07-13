// /client/src/pages/Users.jsx
import React, { useEffect, useState } from "react";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { getUsers, deleteUser, updateUser } from "../utils/api";

export default function Users() {
  const [users, setUsers] = useState([]);

  const toast = (msg, color = "#0d6efd") => {
    Toastify({
      text: msg,
      duration: 3000,
      gravity: "top",
      position: "right",
      style: { background: color },
    }).showToast();
  };

  const fetchUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      toast("Failed to load users", "#dc3545");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      toast("User deleted", "#dc3545");
      fetchUsers();
    } catch {
      toast("Delete failed", "#dc3545");
    }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === "admin" ? "staff" : "admin";
    try {
      await updateUser(user._id, { ...user, role: newRole });
      toast(`Role updated to ${newRole}`);
      fetchUsers();
    } catch {
      toast("Failed to update role", "#dc3545");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div>
      <h2 className="mb-4">Users</h2>
      <div className="table-responsive">
        <table className="table table-bordered align-middle">
          <thead className="table-light">
            <tr>
              <th>#</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u._id}>
                <td>{i + 1}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>
                  <span className={`badge bg-${u.role === "admin" ? "primary" : "secondary"}`}>
                    {u.role}
                  </span>
                </td>
                <td>
                  {u.email !== "admin" && (
                    <>
                      <button
                        className="btn btn-sm btn-outline-warning me-2"
                        onClick={() => toggleRole(u)}
                      >
                        Make {u.role === "admin" ? "Staff" : "Admin"}
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(u._id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
