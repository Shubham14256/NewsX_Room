"use client";

// global-error.tsx catches crashes in the root layout itself.
// error.tsx only catches crashes inside route segments.
// Both are needed for full coverage.

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[GlobalError - Layout Level]", error);
  }, [error]);

  // Must include <html> and <body> — this replaces the root layout entirely
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0a0a0a", color: "#f5f5f5", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ display: "flex", minHeight: "100vh", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
          <div style={{ textAlign: "center", maxWidth: 480 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
              <div style={{ background: "#450a0a", borderRadius: 16, padding: "1rem", display: "inline-flex" }}>
                <AlertTriangle style={{ width: 32, height: 32, color: "#f87171" }} />
              </div>
            </div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 900, marginBottom: "0.75rem" }}>
              NewsroomX — Critical Error
            </h1>
            <p style={{ color: "#a3a3a3", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: "0.75rem" }}>
              The application encountered an unrecoverable error. Our team has been notified.
            </p>
            {error.digest && (
              <p style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#737373", marginBottom: "1.5rem" }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "#fff", color: "#0a0a0a", border: "none", borderRadius: 12, padding: "0.75rem 1.5rem", fontWeight: 700, fontSize: "0.875rem", cursor: "pointer" }}
            >
              <RefreshCw style={{ width: 16, height: 16 }} />
              Reload Application
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
