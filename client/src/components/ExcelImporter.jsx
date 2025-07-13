// /client/src/components/ExcelImporter.jsx
import React from "react";
import * as XLSX from "xlsx";

export default function ExcelImporter({ onImport }) {
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);
      onImport(json);
    };
    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="my-3">
      <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} className="form-control" />
    </div>
  );
}
