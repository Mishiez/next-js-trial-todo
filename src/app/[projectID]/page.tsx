"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import { useEffect, useState } from "react";

// Define the GraphQL query
const GET_PROJECT_TASKS = gql`
  query GetProjectTasks($projectId: Int!) {
    retrieveProjectTasks(projectId: $projectId) {
      id
      name
      description
      dateDue
      dateCompleted
      project {
        id
      }
      creator {
        id
        email
      }
    }
  }
`;

// Define the type for the query response
interface Task {
  id: string;
  name: string;
  description: string;
  dateDue: string;
  dateCompleted: string | null;
  project: { id: string };
  creator: { id: string; email: string };
}

interface QueryData {
  retrieveProjectTasks: Task[];
}

export default function ProjectTasks() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.projectId ? parseInt(params.projectId as string) : 0;
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Move useQuery to the top level with skip option
  const { data, loading, error } = useQuery<QueryData>(GET_PROJECT_TASKS, {
    variables: { projectId },
    skip: !projectId || !isLoggedIn, // Skip query if no projectId or not logged in
  });

  useEffect(() => {
    // Check login status only on the client side
    const loginStatus = typeof window !== "undefined" ? localStorage.getItem("loggedIn") === "true" : false;
    setIsLoggedIn(loginStatus);

    if (!loginStatus) {
      router.push("/login");
    }
  }, [router]);

  // Handle navigation after hook call
  if (!isLoggedIn) {
    return null; // Return null to prevent rendering until redirect completes
  }

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks for Project {projectId}</h1>
      <ul className="space-y-2">
        {data?.retrieveProjectTasks?.map((task) => (
          <li key={task.id} className="p-4 bg-gray-100 rounded">
            <h2 className="text-lg font-semibold">{task.name}</h2>
            <p>{task.description}</p>
            <p>Due: {task.dateDue}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}