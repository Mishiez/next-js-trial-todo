// src/components/Storage.tsx
import { useCallback } from "react";
import Project from "./Project";
import Task from "./Task";
import TodoList from "./TodoList";
import {
  useCreateProjectMutation,
  useCreateProjectTaskMutation,
  useDeleteProjectTaskMutation,
  useDeleteProjectMutation,
  useUpdateProjectTaskMutation,
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
  const [updateTaskMutation] = useUpdateProjectTaskMutation();

  const todoList = new TodoList();

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
  }, [createProjectMutation]);

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
          projectId: project.id, // Still passed in args, but not queried back
          dateDue: formattedDateDue,
        },
      },
      onCompleted: (data) => {
        if (data.createProjectTask) {
          const newTask = new Task(task.getName(), task.getDate());
          newTask.id = data.createProjectTask.id;
          // Use project.id from the local project object since projectId isn't returned
          project.addTask(newTask);
        }
      },
    });
  }, [createTaskMutation]);

  const deleteProject = useCallback(async (projectName: string) => {
    const project = todoList.getProject(projectName);
    if (!project?.id) return;

    await deleteProjectMutation({
      variables: { projectId: parseInt(project.id) },
      onCompleted: () => {
        todoList.deleteProject(projectName);
      },
    });
  }, [deleteProjectMutation]);

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
  }, [deleteTaskMutation]);

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
        if (data.updateProjectTask) {
          task.setName(data.updateProjectTask.name);
        }
      },
    });
  }, [updateTaskMutation]);

  const setTaskDate = useCallback(async (projectName: string, taskName: string, newDueDate: string) => {
    const project = todoList.getProject(projectName);
    const task = project?.getTask(taskName);
    if (!task?.id) return;

    const formattedDateDue = `${new Date(newDueDate).getFullYear()}-${String(new Date(newDueDate).getMonth() + 1).padStart(2, "0")}-${String(new Date(newDueDate).getDate()).padStart(2, "0")} ${String(new Date(newDueDate).getHours()).padStart(2, "0")}:${String(new Date(newDueDate).getMinutes()).padStart(2, "0")}:${String(new Date(newDueDate).getSeconds()).padStart(2, "0")}.000000 +0300`;

    await updateTaskMutation({
      variables: {
        args: {
          id: parseInt(task.id),
          dateDue: formattedDateDue,
        },
      },
      onCompleted: (data) => {
        if (data.updateProjectTask) {
          task.setDate(data.updateProjectTask.dateDue);
        }
      },
    });
  }, [updateTaskMutation]);

  const updateTodayProject = useCallback(() => {
    todoList.updateTodayProject();
  }, []);

  const updateWeekProject = useCallback(() => {
    todoList.updateWeekProject();
  }, []);

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