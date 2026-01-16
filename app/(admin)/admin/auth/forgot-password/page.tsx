"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, KeyRound } from "lucide-react";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authService.dashboardPasswordReset(email);
      setLoading(false);
      setSent(true);
      toast.success("Password reset link sent to your email");
    } catch (err: any) {
      setLoading(false);
      const errorMessage =
        err?.response?.data?.email?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to send password reset link. Please try again.";
      setError(errorMessage);
      toast.error(errorMessage);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">
          <div className="bg-secondary rounded-2xl shadow-sm p-8 border border-accent-2 text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                <KeyRound size={32} className="text-green-600" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-primary mb-2">
              Check Your Email
            </h1>
            <p className="text-grey text-sm mb-6">
              We&apos;ve sent password reset instructions to{" "}
              <strong>{email}</strong>
            </p>

            <Link
              href="/admin/auth/login"
              className="inline-block w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all font-medium"
            >
              Back to Login
            </Link>

            <p className="text-sm text-grey mt-4">
              Didn&apos;t receive the email?{" "}
              <button
                onClick={() => setSent(false)}
                className="text-primary hover:underline font-medium"
              >
                Try again
              </button>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-sm p-8 border border-accent-2">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center">
              <KeyRound size={32} className="text-primary" />
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-primary mb-2">
              Forgot Password?
            </h1>
            <p className="text-grey text-sm">
              Enter your email address and we&apos;ll send you instructions to
              reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-primary mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${
                  error ? "border-red-500" : "border-accent-2"
                }`}
                placeholder="admin@example.com"
              />
              {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Sending...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Back to login */}
          <div className="text-center mt-6">
            <Link
              href="/admin/auth/login"
              className="text-sm text-grey hover:text-primary transition-colors"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
