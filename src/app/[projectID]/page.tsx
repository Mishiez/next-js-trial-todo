"use client";

import { useParams, useRouter } from "next/navigation"; // Import useRouter
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";

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

export default function ProjectTasks() {
  const params = useParams();
  const router = useRouter(); // Initialize router
  const projectId = params.projectId ? parseInt(params.projectId as string) : 0;
  const isLoggedIn = localStorage.getItem("loggedIn") === "true";

  if (!isLoggedIn) {
    router.push("/login");
    return null;
  }

  const { data, loading, error } = useQuery(GET_PROJECT_TASKS, {
    variables: { projectId },
    skip: !projectId || !isLoggedIn,
  });

  if (loading) return <p>Loading tasks...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks for Project {projectId}</h1>
      <ul className="space-y-2">
        {data?.retrieveProjectTasks?.map((task: any) => (
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