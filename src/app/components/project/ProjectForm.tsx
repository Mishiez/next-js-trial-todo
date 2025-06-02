"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, ProjectFormData } from "@/app/components/types/todo";

interface ProjectFormProps {
  onAddProject: (data: ProjectFormData) => Promise<void>;
}

export default function ProjectForm({ onAddProject }: ProjectFormProps) {
  const { register, handleSubmit, formState: { errors, isValid }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: { newProjectName: "" },
  });

  const handleAddProject = handleSubmit(async (data) => {
    await onAddProject(data);
    reset();
  });

  return (
    <form onSubmit={handleAddProject} className="flex flex-col gap-3">
      <div>
        <input
          {...register("newProjectName")}
          type="text"
          placeholder="Add a new project..."
          className="flex-1 p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors placeholder-black text-gray-900"
        />
        {errors.newProjectName && (
          <p className="text-red-500 text-sm mt-1">{errors.newProjectName.message}</p>
        )}
      </div>
      <button
        type="submit"
        className={`p-3 bg-green-600 text-white rounded-xl border-none transition-all ${
          isValid ? "cursor-pointer hover:bg-green-700 hover:scale-105" : "bg-gray-400 cursor-not-allowed"
        }`}
      >
        Add Project
      </button>
    </form>
  );
}