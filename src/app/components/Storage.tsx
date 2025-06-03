// src/app/components/Storage.tsx
"use client";

import { useCallback, useMemo } from "react";
import Project from "./Project";
import Task from "./Task";
import TodoList from "./TodoList";
import {
  useCreateProjectMutation,
  useCreateProjectTaskMutation,
  useDeleteProjectTaskMutation,
  useDeleteProjectMutation,
  useUpdateProjectTaskMutation, // Fixed: Use correct mutation hook
} from "@/lib/generated/graphql";

// Interface for Storage operations
interface StorageInterface {
  todoList: TodoList;
  createProject: (projectName: string) => Promise<void>;
  createTask: (projectName: string, task: Task) => Promise<void>;
  deleteProject: (projectName: string) => Promise<void>;
  deleteTask: (projectName: string, taskName: string) => Promise<void>;
  renameTask: (projectName: string, taskName: string, newTaskName: string) => Promise<void>;
  setTaskDate: (projectName: string, taskName: string, newDueDate: string) => Promise<void>;
  updateTodayProject: () => void;
  updateWeekProject: () => void;
}

export const useStorage = (): StorageInterface => {
  const [createProjectMutation] = useCreateProjectMutation();
  const [createTaskMutation] = useCreateProjectTaskMutation();
  const [deleteTaskMutation] = useDeleteProjectTaskMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation();
  const [updateTaskMutation] = useUpdateProjectTaskMutation(); // Fixed: Use correct mutation

  // Fixed: Use useMemo to create todoList only once
  const todoList = useMemo(() => new TodoList(), []);

  const createProject = useCallback(async (projectName: string) => {
    const dueDate = new Date("2025-12-31T00:00:00.000Z");
    const formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")} ${String(dueDate.getHours() + 3).padStart(2, "0")}:${String(dueDate.getMinutes()).padStart(2, "0")}:${String(dueDate.getSeconds()).padStart(2, "0")}.000000 +0300`;

    await createProjectMutation({
      variables: {
        args: {
          name: projectName,
          description: "Created from frontend",
          dateDue: formattedDate,
        },
      },
      onCompleted: (data) => {
        if (data.createProject) {
          const newProject = new Project(projectName);
          newProject.id = data.createProject.id;
          todoList.addProject(newProject);
        }
      },
    });
  }, [createProjectMutation, todoList]);

  const createTask = useCallback(async (projectName: string, task: Task) => {
    const project = todoList.getProject(projectName);
    if (!project?.id) return;

    const dueDate = task.getDate() === "No date" ? new Date() : new Date(task.getDate());
    const formattedDateDue = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")} ${String(dueDate.getHours()).padStart(2, "0")}:${String(dueDate.getMinutes()).padStart(2, "0")}:${String(dueDate.getSeconds()).padStart(2, "0")}.000000 +0300`;

    await createTaskMutation({
      variables: {
        args: {
          name: task.getName(),
          description: "Task created from frontend",
          projectId: project.id,
          dateDue: formattedDateDue,
        },
      },
      onCompleted: (data) => {
        if (data.createProjectTask) {
          const newTask = new Task(task.getName(), task.getDate());
          newTask.id = data.createProjectTask.id;
          project.addTask(newTask);
        }
      },
    });
  }, [createTaskMutation, todoList]);

  const deleteProject = useCallback(async (projectName: string) => {
    const project = todoList.getProject(projectName);
    if (!project?.id) return;

    await deleteProjectMutation({
      variables: { projectId: parseInt(project.id) },
      onCompleted: () => {
        todoList.deleteProject(projectName);
      },
    });
  }, [deleteProjectMutation, todoList]);

  const deleteTask = useCallback(async (projectName: string, taskName: string) => {
    const project = todoList.getProject(projectName);
    const task = project?.getTask(taskName);
    if (!task?.id) return;

    await deleteTaskMutation({
      variables: { taskId: parseInt(task.id) },
      onCompleted: () => {
        project.deleteTask(taskName);
      },
    });
  }, [deleteTaskMutation, todoList]);

  const renameTask = useCallback(async (projectName: string, taskName: string, newTaskName: string) => {
    const project = todoList.getProject(projectName);
    const task = project?.getTask(taskName);
    if (!task?.id) return;

    await updateTaskMutation({
      variables: {
        args: {
          id: parseInt(task.id),
          name: newTaskName,
        },
      },
      onCompleted: (data) => {
        // Fixed: Check for updateProjectTask instead of createProjectTask
        if (data.updateProjectTask) {
          task.setName(data.updateProjectTask.name);
        }
      },
    });
  }, [updateTaskMutation, todoList]);

  const setTaskDate = useCallback(async (projectName: string, taskName: string, newDueDate: string) => {
    const project = todoList.getProject(projectName);
    const task = project?.getTask(taskName);
    if (!task?.id) return;

    // Fixed: Remove extra spaces in date formatting
    const dueDate = new Date(newDueDate);
    const formattedDateDue = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, "0")}-${String(dueDate.getDate()).padStart(2, "0")} ${String(dueDate.getHours()).padStart(2, "0")}:${String(dueDate.getMinutes()).padStart(2, "0")}:${String(dueDate.getSeconds()).padStart(2, "0")}.000000 +0300`;

    await updateTaskMutation({
      variables: {
        args: {
          id: parseInt(task.id),
          dateDue: formattedDateDue,
        },
      },
      onCompleted: (data) => {
        // Fixed: Check for updateProjectTask instead of createProjectTask
        if (data.updateProjectTask) {
          task.setDate(data.updateProjectTask.dateDue);
        }
      },
    });
  }, [updateTaskMutation, todoList]);

  const updateTodayProject = useCallback(() => {
    todoList.updateTodayProject();
  }, [todoList]);

  const updateWeekProject = useCallback(() => {
    todoList.updateWeekProject();
  }, [todoList]);

  return {
    todoList,
    createProject,
    createTask,
    deleteProject,
    deleteTask,
    renameTask,
    setTaskDate,
    updateTodayProject,
    updateWeekProject,
  };
};