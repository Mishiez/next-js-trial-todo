// src/app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import LoginForm from "@/app/components/auth/LoginForm";

export default function LoginPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push("/"); // Navigate to home page
  };

  return <LoginForm onLogin={handleLogin} />;
}