// /client/src/components/ExcelExporter.jsx
import React from "react";
import * as XLSX from "xlsx";

export default function ExcelExporter({ data, filename = "export.xlsx" }) {
  const handleExport = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, filename);
  };

  return (
    <button onClick={handleExport} className="btn btn-outline-success btn-sm">
      Export Excel
    </button>
  );
}
