"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import Image from "next/image";
import { authService } from "@/services/auth.service";
import toast from "react-hot-toast";

export default function PasswordResetPage() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    newPassword?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const uid = searchParams.get("uid") as string;
  const token = searchParams.get("token") as string;

  useEffect(() => {
    if (!uid || !token) {
      toast.error("Invalid reset link. Please request a new password reset.");
      router.push("/admin/auth/forgot-password");
    }
  }, [uid, token, router]);

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!uid || !token) {
      toast.error("Invalid reset link");
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      await authService.dashboardPasswordResetConfirm(
        uid!,
        token,
        formData.newPassword,
        formData.confirmPassword
      );
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err: any) {
      console.error("Password reset error:", err);
      const errorMessage =
        err?.response?.data?.confirm_password?.[0] ||
        err?.response?.data?.new_password?.[0] ||
        err?.response?.data?.token?.[0] ||
        err?.response?.data?.uid?.[0] ||
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        "Failed to reset password. Please try again.";
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="w-full max-w-md">
          <div className="bg-secondary rounded-2xl shadow-sm p-8 border border-accent-2">
            <div className="flex items-center justify-center">
              <Image
                src="/assets/thebiblesays_logo.png"
                alt="The Bible Says Logo"
                className="w-32"
                width={1000}
                height={1000}
              />
            </div>

            <div className="text-center mt-8 space-y-4">
              <h1 className="text-2xl font-medium text-primary">
                Password successfully created
              </h1>
              <p className="text-grey text-sm">
                Your new password has been set. You can now log in securely with
                your updated credentials
              </p>
            </div>

            <div className="mt-8">
              <Link
                href="/admin/auth/login"
                className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all flex items-center justify-center font-medium"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!uid || !token) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="w-full max-w-md">
        <div className="bg-secondary rounded-2xl shadow-sm p-8 border border-accent-2">
          <div className="flex items-center justify-center">
            <Image
              src="/assets/thebiblesays_logo.png"
              alt="The Bible Says Logo"
              className="w-32"
              width={1000}
              height={1000}
            />
          </div>

          <div className="mt-8 mb-6">
            <h1 className="text-2xl font-medium text-primary mb-2">
              Create new Password
            </h1>
            <p className="text-grey text-sm">
              Create a new password for your account
            </p>
            <p className="text-grey text-sm">
              Make sure it&apos;s strong and easy to remember
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-primary mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, newPassword: e.target.value });
                    setErrors({ ...errors, newPassword: undefined });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all pr-12 ${
                    errors.newPassword
                      ? "border-red-500"
                      : "border-accent-2 focus:border-primary"
                  }`}
                  placeholder="At least 8 characters"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-primary transition-colors"
                >
                  {showNewPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="mt-2 text-sm text-red-600">{errors.newPassword}</p>
              )}
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-primary mb-2"
              >
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      confirmPassword: e.target.value,
                    });
                    setErrors({ ...errors, confirmPassword: undefined });
                  }}
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none transition-all pr-12 ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-accent-2 focus:border-primary"
                  }`}
                  placeholder="At least 8 characters"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-grey hover:text-primary transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Resetting Password...
                </>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

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
