// /client/src/components/BootstrapFooter.jsx
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BootstrapFooter() {
  return (
    <footer className="bg-light text-center text-muted py-3 mt-auto border-top">
      <div className="container">
        &copy; {new Date().getFullYear()} Smart Inventory System. All rights reserved.
      </div>
    </footer>
  );
}
