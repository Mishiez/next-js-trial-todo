import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// This is the correct schema
const taskSchema = z.object({
  name: z.string().min(1, "name is required"),
  description: z.string().min(1, "Description is required"),
  dueDate: z.string().min(1, "Due date is required"),
});


type TaskFormData = z.infer<typeof taskSchema>;

export default function TaskForm({ onAddTask }: { onAddTask: (task: TaskFormData) => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
  });

  const onSubmit = (data: TaskFormData) => {
    onAddTask(data);     // Send task to parent
    reset();             // Clear form
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Task Name</label>
        <input {...register("name")} className="border p-2 w-full" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <label>Description</label>
        <textarea {...register("description")} className="border p-2 w-full" />
      </div>

      <div>
        <label>Due Date</label>
        <input type="date" {...register("dueDate")} className="border p-2 w-full" />
        {errors.dueDate && <p className="text-red-500">{errors.dueDate.message}</p>}
      </div>

      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
        Add Task
      </button>
    </form>
  );
}
