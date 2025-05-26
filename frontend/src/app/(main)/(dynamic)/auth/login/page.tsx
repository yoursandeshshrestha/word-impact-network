"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

import { Lock, Mail, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useLoading } from "@/common/contexts/LoadingContext";
import { toast } from "sonner";
import Link from "next/link";
import { login } from "@/common/services/auth";

const LoginPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { setLoading } = useLoading();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Use the login function from auth service
    const result = await login(formData.email, formData.password);

    if (result.success) {
      toast.success("Logged in successfully!");

      // Redirect based on user role if needed
      const user = result.user;
      let redirectPath = "/my-learning";

      if (user && user.role === "ADMIN") {
        redirectPath = "/admin/dashboard";
      }

      // Redirect after successful login
      setTimeout(() => {
        router.push(redirectPath);
      }, 1000);
    } else {
      setError(result.message || "Login failed");
      toast.error(result.message || "Login failed");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white pt-32">
      <main className="py-16 px-4">
        <div className="mx-auto max-w-md">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Login to your account
            </h1>
            <p className="text-gray-600">
              Access your Word Impact Network account
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="bg-white p-8 rounded-md shadow-sm border border-gray-200"
          >
            {error && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-md border border-red-100 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 px-4 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="your@email.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-gray-500 transition-colors"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="text-gray-400 hover:text-gray-500 focus:outline-none"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-sm text-gray-600 hover:text-gray-800"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-700 text-white px-4 py-2.5 rounded-md font-medium flex items-center justify-center transition-colors"
              >
                Login
                <ArrowRight className="ml-2 w-4 h-4" />
              </button>

              <div className="text-center mt-6 text-sm">
                <p className="text-gray-600">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/auth/apply"
                    className="text-gray-800 font-medium"
                  >
                    Apply now
                  </Link>
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
