"use client";

import { useRouter } from "next/navigation";
import { Project } from "@/app/components/types/todo";
import TaskList from "@/app/components/task/TaskList";

interface ProjectListProps {
  projects: Project[];
  onToggleProjectCompletion: (projectIndex: number) => void;
  onDeleteProject: (projectIndex: number) => void;
  onToggleTaskCompletion: (projectIndex: number, taskIndex: number) => void;
  onDeleteTask: (projectIndex: number, taskIndex: number) => void;
}

export default function ProjectList({
  projects,
  onToggleProjectCompletion,
  onDeleteProject,
  onToggleTaskCompletion,
  onDeleteTask,
}: ProjectListProps) {
  const router = useRouter();

  if (projects.length === 0) {
    return (
      <p className="text-blue-900 text-center p-6 bg-yellow-100 rounded-xl">
        No projects yet! Start by adding one above.
      </p>
    );
  }

  return (
    <div>
      {projects.map((project, pIndex) => (
        <div
          key={pIndex}
          className="bg-yellow-100 rounded-xl p-4 mb-6 shadow-sm cursor-pointer"
          onClick={() => router.push(`/${project.id}`)}
        >
          <div className="flex flex-col items-center justify-between mb-4 gap-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={project.completed}
                onChange={(e) => {
                  e.stopPropagation();
                  onToggleProjectCompletion(pIndex);
                }}
                className="h-5 w-5 accent-green-600 border-yellow-200 rounded"
              />
              <h3
                className={`text-xl font-semibold ${
                  project.completed ? "text-gray-400 line-through" : "text-black"
                }`}
              >
                {project.name}
              </h3>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteProject(pIndex);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-red-600 hover:scale-105 transition-all"
            >
              Delete Project
            </button>
          </div>
          <TaskList
            tasks={project.tasks}
            projectIndex={pIndex}
            onToggleTaskCompletion={onToggleTaskCompletion}
            onDeleteTask={onDeleteTask}
          />
        </div>
      ))}
    </div>
  );
}