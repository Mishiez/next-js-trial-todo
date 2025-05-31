"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskFormData, Project } from "@/app/components/types/todo";

interface TaskFormProps {
  projects: Project[];
  selectedProjectIndex: number | null;
  setSelectedProjectIndex: (index: number | null) => void;
  onAddTask: (data: TaskFormData) => Promise<void>;
}

export default function TaskForm({
  projects,
  selectedProjectIndex,
  setSelectedProjectIndex,
  onAddTask,
}: TaskFormProps) {
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: { newTask: "", description: "", dateDue: "" },
  });

  const handleAddTask = handleSubmit(async (data) => {
    if (selectedProjectIndex !== null) {
      await onAddTask(data);
      reset();
    }
  });

  return (
    <form onSubmit={handleAddTask} className="flex flex-col gap-3">
      <select
        value={selectedProjectIndex ?? ""}
        onChange={(e) => setSelectedProjectIndex(e.target.value ? parseInt(e.target.value) : null)}
        className="flex-1 p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors text-blue-900"
      >
        <option value="">Select a project</option>
        {projects.map((project, index) => (
          <option key={index} value={index}>
            {project.name}
          </option>
        ))}
      </select>
      <div>
        <input
          {...register("newTask")}
          type="text"
          placeholder="Add a new task..."
          disabled={selectedProjectIndex === null}
          className={`flex-1 p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors placeholder-black text-gray-900 ${
            selectedProjectIndex === null ? "opacity-50 cursor-not-allowed" : "cursor-text"
          }`}
        />
        {errors.newTask && (
          <p className="text-red-500 text-sm mt-1">{errors.newTask.message}</p>
        )}
      </div>
      <div>
        <input
          {...register("description")}
          type="text"
          placeholder="Task description..."
          disabled={selectedProjectIndex === null}
          className={`flex-1 p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors placeholder-black text-gray-900 ${
            selectedProjectIndex === null ? "opacity-50 cursor-not-allowed" : "cursor-text"
          }`}
        />
        {errors.description && (
          <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
        )}
      </div>
      <div>
        <input
          {...register("dateDue")}
          type="datetime-local"
          disabled={selectedProjectIndex === null}
          className={`flex-1 p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors placeholder-black text-gray-900 ${
            selectedProjectIndex === null ? "opacity-50 cursor-not-allowed" : "cursor-text"
          }`}
        />
        {errors.dateDue && (
          <p className="text-red-500 text-sm mt-1">{errors.dateDue.message}</p>
        )}
      </div>
      <button
        type="submit"
        disabled={selectedProjectIndex === null || !isValid}
        className={`p-3 bg-blue-500 text-white rounded-xl border-none transition-all ${
          selectedProjectIndex !== null && isValid
            ? "cursor-pointer hover:bg-blue-600 hover:scale-105"
            : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Add Task
      </button>
    </form>
  );
}