"use client";

import { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Eye, EyeOff } from "lucide-react";

type Mode = "login" | "register" | "forgot";

export default function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmPassword] = useState(false);

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
        window.location.reload();
      }

      if (mode === "register") {
        await axios.post("/api/auth/register", {
          name: form.name,
          email: form.email,
          password: form.password,
        });
        window.location.reload();
      }

      if (mode === "forgot") {
        await axios.patch("/api/auth/forgot_password", {
          email: form.email,
          password: form.password,
        });

        await Swal.fire({
          icon: "success",
          title: "Password reset",
          text: "Your password has been reset successfully",
          confirmButtonText: "Login",
        });

        setMode("login");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Action failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        <h2 className="text-2xl font-bold text-center mb-2">
          {mode === "login" && "Welcome back"}
          {mode === "register" && "Create an account"}
          {mode === "forgot" && "Reset password"}
        </h2>

        <p className="text-sm text-gray-500 text-center mb-6">
          {mode === "login" && "Login to continue"}
          {mode === "register" && "Register a new account"}
          {mode === "forgot" && "Enter your email and new password"}
        </p>

        {error && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <input
              name="name"
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          )}

          <input
            name="email"
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={handleChange}
            className="w-full border rounded-lg px-4 py-2"
          />

          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder={mode === "forgot" ? "New password" : "Password"}
              value={form.password}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {(mode === "register" || mode === "forgot") && (
            <div className="relative">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full border rounded-lg px-4 py-2"
              />
              <button
                type="button"
                onClick={() => setConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 hover:text-gray-700"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
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
                : mode === "register"
                  ? "Register"
                  : "Reset Password"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          {mode === "login" && (
            <>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-indigo-600 hover:underline mr-4"
              >
                Forgot password?
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className="text-indigo-600 hover:underline"
              >
                Register
              </button>
            </>
          )}

          {(mode === "register" || mode === "forgot") && (
            <button
              type="button"
              onClick={() => setMode("login")}
              className="text-indigo-600 hover:underline"
            >
              Back to login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
