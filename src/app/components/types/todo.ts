import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address").min(1, "Email is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const projectSchema = z.object({
  newProjectName: z.string().min(1, "Project name is required"),
});

export const taskSchema = z.object({
  newTask: z.string().min(1, "Task name is required"),
  description: z.string().min(1, "Description is required"),
  dateDue: z.string().min(1, "Due date is required").refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type ProjectFormData = z.infer<typeof projectSchema>;
export type TaskFormData = z.infer<typeof taskSchema>;

export interface Project {
  id: number;
  name: string;
  status: string; // Maps to ProjectStatus (PENDING, ONGOING, ARCHIVED, COMPLETED)
  dateCompleted: string | null; // Timestamp when completed, or null if not completed
  tasks: Task[];
  completed: boolean; // Derived from status or dateCompleted
}

export interface Task {
  id: number;
  text: string;
  description: string;
  dateDue: string;
  completed: boolean;
}

