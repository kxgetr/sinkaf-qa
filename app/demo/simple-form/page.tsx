"use client";

import { useState } from "react";

export default function SimpleFormPage() {
  const [status, setStatus] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    setStatus("Submitting...");
    
    const res = await fetch("/api/demo/simple-form", {
      method: "POST",
      body: formData
    });
    
    if (res.ok) {
      setStatus("Success: Registered!");
    } else {
      setStatus("Error: Failed to register");
    }
  };

  return (
    <div style={{ padding: 40, fontFamily: "sans-serif" }}>
      <h1>Demo: Simple Form</h1>
      <p>This form intentionally lacks client-side and server-side email validation.</p>
      
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, maxWidth: 300 }}>
        <label>
          Email:
          {/* Missing type="email" intentionally */}
          <input name="email" type="text" data-sinkaf-id="demo-email-input" />
        </label>
        <button type="submit" data-sinkaf-id="demo-submit-btn">Register</button>
      </form>
      
      {status && <p style={{ marginTop: 20, fontWeight: "bold" }}>{status}</p>}
    </div>
  );
}
