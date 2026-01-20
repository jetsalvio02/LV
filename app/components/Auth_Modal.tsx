"use client";

import { useState } from "react";
import axios from "axios";

type Mode = "login" | "register";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Email and password are required.");
      return;
    }

    if (mode === "register") {
      if (!form.name) {
        setError("Full name is required.");
        return;
      }

      if (form.password !== form.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);

      if (mode === "login") {
        await axios.post("/api/auth/login", {
          email: form.email,
          password: form.password,
        });
      } else {
        await axios.post("/api/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
      }

      // refresh app state (cookie-based auth)
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* HEADER */}
        <h2 className="text-2xl font-bold text-center mb-2">
          {mode === "login" ? "Welcome back" : "Create an account"}
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {mode === "login"
            ? "Login to continue voting"
            : "Register to participate in the poll"}
        </p>

        {/* ERROR */}
        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              name="name"
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2
              focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          {mode === "register" && (
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2
                focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-lg font-semibold text-white
              bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading
              ? "Please wait..."
              : mode === "login"
              ? "Login"
              : "Register"}
          </button>
        </form>

        {/* FOOTER */}
        <div className="mt-6 text-center text-sm">
          {mode === "login" ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Register
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="text-indigo-600 font-semibold hover:underline"
              >
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
