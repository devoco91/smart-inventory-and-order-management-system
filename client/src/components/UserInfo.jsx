// /client/src/components/UserInfo.jsx
import React from "react";
import jwt_decode from "jwt-decode";

export default function UserInfo() {
  const token = localStorage.getItem("token");

  if (!token) return null;

  try {
    const { role, id } = jwt_decode(token);
    return (
      <div className="text-end small text-muted">
        Logged in as <strong>{role}</strong>
      </div>
    );
  } catch {
    return null;
  }
}
