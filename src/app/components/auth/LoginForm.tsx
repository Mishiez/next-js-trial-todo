// src/app/components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { useMutation, gql } from "@apollo/client";

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      jwtToken
      message
    }
  }
`;

interface LoginFormProps {
  onLogin: () => void;
}

export default function LoginForm({ onLogin }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [login, { loading, error }] = useMutation(LOGIN);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await login({ variables: { email, userPassword } });
      console.log("Login response:", data);
      const token = data?.login?.jwtToken;
      if (token) {
        localStorage.setItem("token", token);
        console.log("Token stored:", token);
        if (onLogin) onLogin();
      } else {
        console.error("No token received, message:", data?.login?.message);
      }
    } catch (err) {
      console.error("Login error:", err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-orange-200 to-orange-400">
      <div className="bg-white rounded-lg p-6 w-full max-w-sm shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">Login</h2>
        <p className="text-sm text-gray-600 mb-4">
          Current Time: {new Date().toLocaleString("en-US", { timeZone: "Africa/Nairobi" })}
        </p>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full p-2 mb-3 bg-orange-50 text-gray-800 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200"
            required
            disabled={loading}
          />
          <input
            type="password"
            value={userPassword}
            onChange={(e) => setUserPassword(e.target.value)}
            placeholder="Password"
            className="w-full p-2 mb-3 bg-orange-50 text-gray-800 border border-orange-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-lg text-white ${
              loading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-700"
            } focus:outline-none focus:ring-2 focus:ring-orange-400 transition duration-200`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
          {error && <p className="text-red-600 mt-2 text-sm">Error: {error.message}</p>}
        </form>
      </div>
    </div>
  );
}