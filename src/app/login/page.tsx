// src/app/login/page.tsx
"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("loggedIn", "true");
    }
    router.push("/");
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        <button
          onClick={handleLogin}
          className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
        >
          Login
        </button>
      </div>
    </div>
  );
}