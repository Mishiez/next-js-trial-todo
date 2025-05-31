"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client";
import { gql } from "@apollo/client";
import TaskForm from "@/components/TaskForm"; // Adjust the path if needed
import { useState } from "react";

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
  const router = useRouter();
  const projectId = params.projectId ? parseInt(params.projectId as string) : 0;

  const isLoggedIn = typeof window !== "undefined" && localStorage.getItem("loggedIn") === "true";
  if (!isLoggedIn) {
    router.push("/login");
    return null;
  }

  const { data, loading, error } = useQuery(GET_PROJECT_TASKS, {
    variables: { projectId },
    skip: !projectId || !isLoggedIn,
  });

  const [localTasks, setLocalTasks] = useState<any[]>([]);

  const handleAddTask = (task: { title: string; description: string; dueDate: string }) => {
    const newTask = {
      id: Date.now(), // Fake ID for now
      name: task.title,
      description: task.description,
      dateDue: task.dueDate,
    };
    setLocalTasks(prev => [...prev, newTask]);
  };

  const allTasks = [...(data?.retrieveProjectTasks || []), ...localTasks];

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks for Project {projectId}</h1>

      <TaskForm onAddTask={handleAddTask} />

      <ul className="space-y-2 mt-6">
        {allTasks.map((task: any) => (
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
