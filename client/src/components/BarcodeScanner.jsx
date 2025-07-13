import React, { useEffect, useRef, useState } from "react";
import Quagga from "quagga";
import "bootstrap/dist/css/bootstrap.min.css";

export default function BarcodeScanner({ onDetected }) {
  const scannerRef = useRef(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const lastScanTime = useRef(0);

  useEffect(() => {
    if (!scanning) return;

    Quagga.init({
      inputStream: {
        type: "LiveStream",
        target: scannerRef.current,
        constraints: {
          facingMode: "environment",
        },
      },
      decoder: {
        readers: [
          "code_128_reader",
          "ean_reader",
          "ean_8_reader",
          "upc_reader",
          "code_39_reader",
          "codabar_reader",
          "i2of5_reader",
          "2of5_reader",
          "upc_e_reader"
        ],
      },
      locate: false,
      numOfWorkers: navigator.hardwareConcurrency || 4,
    }, (err) => {
      if (err) {
        console.error("Quagga init error:", err);
        setError("Camera init failed");
        return;
      }
      Quagga.start();

      const observer = new MutationObserver(() => {
        const canvas = scannerRef.current?.querySelector("canvas");
        if (canvas) {
          canvas.getContext("2d", { willReadFrequently: true });
          observer.disconnect();
        }
      });

      observer.observe(scannerRef.current, { childList: true, subtree: true });
    });

    const beep = new Audio("/beep1.mp3");

    const onDetectedHandler = (result) => {
      const code = result?.codeResult?.code;
      const format = result?.codeResult?.format;
      const now = Date.now();

      if (code && now - lastScanTime.current > 2000) {
        lastScanTime.current = now;
        Quagga.offDetected(onDetectedHandler);
        Quagga.stop();
        beep.play().catch(() => {});
        setScanning(false);
        onDetected(code, format);
      }
    };

    Quagga.onDetected(onDetectedHandler);

    return () => {
      Quagga.offDetected(onDetectedHandler);
      Quagga.stop();
    };
  }, [scanning, onDetected]);

  return (
    <div className="text-center">
      <div
        ref={scannerRef}
        className="border border-secondary rounded"
        style={{ width: "100%", height: 260, marginBottom: 10 }}
      />
      {error && <div className="text-danger mb-2">{error}</div>}
      <div className="btn-group">
        <button
          className="btn btn-primary"
          onClick={() => { setError(null); setScanning(true); }}
          disabled={scanning}
        >
          {scanning ? "Scanning..." : "Start Scan"}
        </button>
        {scanning && (
          <button className="btn btn-danger" onClick={() => { Quagga.stop(); setScanning(false); }}>
            Stop
          </button>
        )}
      </div>
    </div>
  );
}
