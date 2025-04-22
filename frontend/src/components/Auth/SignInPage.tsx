"use client";
import React, { useState } from "react";
import { ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

interface SignInPageProps {
  isVisible: boolean;
}

const SignInPage: React.FC<SignInPageProps> = ({ isVisible }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Sign in submitted:", { email, password, rememberMe });
    // Add your authentication logic here
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <section className="pt-20 pb-20 md:pt-32 md:pb-32 min-h-screen flex justify-center items-center bg-white">
      <div className="max-w-lg w-full mx-auto px-4 sm:px-6">
        <div
          className={`transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          <div className="text-center mb-10">
            <h1 className="text-4xl font-light text-gray-900 mb-6 leading-tight">
              Welcome <span className="font-semibold">Back</span>
            </h1>
            <p className="text-lg text-gray-600">
              Sign in to access your Word-Impact-Network account
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
            {/* Subtle gradient background */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full h-full rounded-full bg-gradient-to-r from-purple-50 to-blue-50 blur-3xl -z-10 opacity-40"></div>

            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              {/* Email Field */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="your@email.com"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={togglePasswordVisibility}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={() => setRememberMe(!rememberMe)}
                    className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    Remember me
                  </label>
                </div>
              </div>

              {/* Sign In Button */}
              <div>
                <button
                  type="submit"
                  className="w-full bg-black hover:bg-gray-800 text-white px-8 py-3 rounded-md text-base font-medium flex items-center justify-center group transition-all"
                >
                  Sign In
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">
                  Don&apos;t have an account?
                </span>
              </div>
            </div>

            {/* Register Button */}
            <div>
              <Link
                href="/submit-application"
                className="w-full block text-center border border-gray-300 text-gray-800 hover:border-gray-500 px-8 py-3 rounded-md text-base font-medium transition-all"
              >
                Apply Now
              </Link>
            </div>
          </div>

          {/* Additional options */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <span>Need assistance? </span>
            <Link
              href="/contact"
              className="font-medium text-gray-900 hover:underline transition-all"
            >
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignInPage;
