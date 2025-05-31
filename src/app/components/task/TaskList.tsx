"use client";

import { Task } from "@/app/components/types/todo";

interface TaskListProps {
  tasks: Task[];
  projectIndex: number;
  onToggleTaskCompletion: (projectIndex: number, taskIndex: number) => void;
  onDeleteTask: (projectIndex: number, taskIndex: number) => void;
}

export default function TaskList({
  tasks,
  projectIndex,
  onToggleTaskCompletion,
  onDeleteTask,
}: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-blue-900 italic text-center">
        No tasks yet. Add some above!
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-2">
      {tasks.map((task, tIndex) => (
        <li
          key={tIndex}
          className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={task.completed}
              onChange={() => onToggleTaskCompletion(projectIndex, tIndex)}
              className="h-5 w-5 accent-green-600 border-yellow-200 rounded"
            />
            <div>
              <span
                className={task.completed ? "text-gray-400 line-through" : "text-blue-900"}
              >
                {task.text}
              </span>
              <p className="text-sm text-gray-600">{task.description}</p>
              <p className="text-sm text-gray-600">Due: {task.dateDue}</p>
            </div>
          </div>
          <button
            onClick={() => onDeleteTask(projectIndex, tIndex)}
            className="bg-red-500 text-white px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-red-600 hover:scale-105 transition-all"
          >
            Delete
          </button>
        </li>
      ))}
    </ul>
  );
}