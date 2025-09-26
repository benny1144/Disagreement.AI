// client/src/app/login/page.tsx
"use client";

import { useState, FormEvent, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleEmailChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      if (error) setError(null);
    },
    [error]
  );

  const handlePasswordChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      if (error) setError(null);
    },
    [error]
  );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true); // <-- 2. Set loading to true

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      // First, check if the response was successful
      if (!response.ok) {
        // If not, parse the error JSON and throw it
        const errorData = await response.json();
        throw new Error(errorData.message || "Login failed. Please try again.");
      }

      // On success, navigate and exit the function.
      // This prevents the finally block from running on an unmounted component.
      router.push("/dashboard");
      return;
    } catch (err: any) {
      console.error(err);
      // The error message will now be the specific one from the server
      setError(err.message);
      // Only set loading to false if there was an error.
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">
          Log In to Disagreement.AI
        </h1>
        <form
          id="login-form"
          name="login-form"
          onSubmit={handleSubmit}
          className="space-y-4"
          aria-describedby={error ? "form-error" : undefined}
        >
          {/* Email Input */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={handleEmailChange}
              required
              autoComplete="email"
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
            />
          </div>
          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              required
              autoComplete="current-password"
              className="w-full px-3 py-2 mt-1 text-white bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="••••••••"
            />
          </div>
          {/* 4. Disable button and show loading text when loading */}
          <button
            type="submit"
            form="login-form"
            disabled={loading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
          {error && (
            <p
              id="form-error"
              role="alert"
              className="text-sm text-center text-red-400"
            >
              {error}
            </p>
          )}
        </form>
        <p className="text-sm text-center text-gray-400">
          Don&apos;t have an account? {/* 2. Replace <a> with <Link> */}
          <Link
            href="/signup"
            className="font-medium text-blue-400 hover:underline"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
