// src/types/todo.ts
import { z } from "zod";

// Schema for adding a project
export const projectSchema = z.object({
  newProjectName: z.string().min(1, "Project name is required").max(50, "Project name must be 50 characters or less"),
});

// Schema for adding a task
export const taskSchema = z.object({
  newTask: z.string().min(1, "Task name is required").max(100, "Task name must be 100 characters or less"),
  dateDue: z.string().optional(), // Optional due date, handled as a date string
});