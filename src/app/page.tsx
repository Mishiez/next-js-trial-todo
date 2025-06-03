// src/app/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRetrieveProjectsQuery } from "@/lib/generated/graphql";
import UI from "@/app/components/UI";
import TodoList from "@/app/components/TodoList";
import Project from "@/app/components/Project";
import Task from "@/app/components/Task";

// Force client-side rendering
export const dynamic = "force-dynamic";

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [backendWarning, setBackendWarning] = useState<string | null>(null);
  const { data: projectsData, error: projectsError, refetch: refetchProjects } = useRetrieveProjectsQuery({ pollInterval: 0 });

  // Handle authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  // Handle projects query error
  useEffect(() => {
    if (projectsError) {
      setBackendWarning("Failed to fetch projects due to a backend error.");
    }
  }, [projectsError]);

  // Load projects into TodoList
  const todoList = new TodoList();
  useEffect(() => {
    if (projectsData?.retrieveProjects) {
      const newProjects = projectsData.retrieveProjects.map((p) => {
        const project = new Project(p.name);
        project.id = p.id.toString(); // Ensure ID is a string
        return project;
      });
      todoList.setProjects([
        ...todoList.getProjects().filter((p) => ["Inbox", "Today", "This Week"].includes(p.getName())),
        ...newProjects,
      ]);
    }
  }, [projectsData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsAuthenticated(false);
    router.push("/login");
  };

  if (!isAuthenticated) {
    return <div>Redirecting to login...</div>;
  }

  return (
    <>
      {backendWarning && (
        <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-4 text-center">{backendWarning}</div>
      )}
      <UI onLogout={handleLogout} />
    </>
  );
}