// src/components/UI.tsx
"use client"
import { useCallback, useState, useEffect } from "react";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useStorage } from "./Storage";
import Project from "./Project";
import Task from "./Task";
import { projectSchema, taskSchema } from "@/types/todo";

// Define form schemas
const addProjectSchema = projectSchema;
const addTaskSchema = taskSchema.extend({ dateDue: z.string().optional() }); // Allow optional dateDue

type AddProjectFormData = z.infer<typeof addProjectSchema>;
type AddTaskFormData = z.infer<typeof addTaskSchema>;

interface UIProps {
  onLogout: () => void;
}

export default function UI({ onLogout }: UIProps) {
  const [activeProject, setActiveProject] = useState<string>("Inbox");
  const [isNavOpen, setIsNavOpen] = useState<boolean>(false);
  const { todoList, createProject, createTask, deleteProject, deleteTask, renameTask, setTaskDate, updateTodayProject, updateWeekProject } = useStorage();

  const { register: registerProject, handleSubmit: handleSubmitProject, reset: resetProject, formState: { errors: projectErrors } } = useForm<AddProjectFormData>({
    resolver: zodResolver(addProjectSchema),
  });

  const { register: registerTask, handleSubmit: handleSubmitTask, reset: resetTask, formState: { errors: taskErrors } } = useForm<AddTaskFormData>({
    resolver: zodResolver(addTaskSchema),
  });

  const [isAddProjectPopupOpen, setIsAddProjectPopupOpen] = useState<boolean>(false);
  const [isAddTaskPopupOpen, setIsAddTaskPopupOpen] = useState<boolean>(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editingDueDate, setEditingDueDate] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyboardInput = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsAddProjectPopupOpen(false);
        setIsAddTaskPopupOpen(false);
        setEditingTask(null);
        setEditingDueDate(null);
      }
    };
    document.addEventListener("keydown", handleKeyboardInput);
    return () => document.removeEventListener("keydown", handleKeyboardInput);
  }, []);

  const openProject = useCallback((projectName: string) => {
    setActiveProject(projectName);
    setIsAddProjectPopupOpen(false);
    setIsAddTaskPopupOpen(false);
    setEditingTask(null);
    setEditingDueDate(null);
    setIsNavOpen(false);
  }, []);

  const handleAddProject = async (data: AddProjectFormData) => {
    if (todoList.contains(data.newProjectName)) {
      alert("Project names must be different");
      return;
    }
    await createProject(data.newProjectName);
    resetProject();
    setIsAddProjectPopupOpen(false);
  };

  const handleAddTask = async (data: AddTaskFormData) => {
    if (todoList.getProject(activeProject)?.contains(data.newTask)) {
      alert("Task names must be different");
      return;
    }
    await createTask(activeProject, new Task(data.newTask, data.dateDue || "No date"));
    resetTask();
    setIsAddTaskPopupOpen(false);
  };

  const handleDeleteProject = (projectName: string) => {
    if (activeProject === projectName) setActiveProject("Inbox");
    deleteProject(projectName);
  };

  const handleDeleteTask = (taskName: string) => {
    deleteTask(activeProject, taskName);
  };

  const handleRenameTask = (taskName: string, newTaskName: string) => {
    if (newTaskName && newTaskName !== taskName) {
      renameTask(activeProject, taskName, newTaskName);
    }
    setEditingTask(null);
  };

  const handleSetTaskDate = (taskName: string, newDueDate: string) => {
    setTaskDate(activeProject, taskName, format(new Date(newDueDate), "dd/MM/yyyy"));
    setEditingDueDate(null);
  };

  const openTodayTasks = () => {
    updateTodayProject();
    openProject("Today");
  };

  const openWeekTasks = () => {
    updateWeekProject();
    openProject("This Week");
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar Navigation */}
      <nav id="nav" className={`bg-gray-800 text-white w-64 fixed h-full transform transition-transform ${isNavOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <button id="button-open-nav" onClick={() => setIsNavOpen(!isNavOpen)} className="md:hidden p-4">
          <i className="fas fa-bars text-2xl"></i>
        </button>
        <div className="p-4">
          <button onClick={onLogout} className="mb-4 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
            Logout
          </button>
          <div id="default-projects">
            <button
              id="button-inbox-projects"
              className={`button-default-project flex items-center w-full p-2 rounded ${activeProject === "Inbox" ? "bg-gray-600" : "hover:bg-gray-700"}`}
              onClick={() => openProject("Inbox")}
            >
              <i className="fas fa-inbox mr-2"></i>
              <span>Inbox</span>
            </button>
            <button
              id="button-today-projects"
              className={`button-default-project flex items-center w-full p-2 rounded ${activeProject === "Today" ? "bg-gray-600" : "hover:bg-gray-700"}`}
              onClick={openTodayTasks}
            >
              <i className="fas fa-calendar-day mr-2"></i>
              <span>Today</span>
            </button>
            <button
              id="button-week-projects"
              className={`button-default-project flex items-center w-full p-2 rounded ${activeProject === "This Week" ? "bg-gray-600" : "hover:bg-gray-700"}`}
              onClick={openWeekTasks}
            >
              <i className="fas fa-calendar-week mr-2"></i>
              <span>This Week</span>
            </button>
          </div>
          <div id="projects-list" className="mt-4">
            {todoList.getProjects().map((project) => {
              const projectName = project.getName();
              if (["Inbox", "Today", "This Week"].includes(projectName)) return null;
              return (
                <button
                  key={projectName}
                  className={`button-project flex justify-between items-center w-full p-2 rounded ${activeProject === projectName ? "bg-gray-600" : "hover:bg-gray-700"}`}
                  onClick={() => openProject(projectName)}
                >
                  <div className="left-project-panel flex items-center">
                    <i className="fas fa-tasks mr-2"></i>
                    <span>{projectName}</span>
                  </div>
                  <div className="right-project-panel">
                    <i
                      className="fas fa-times text-red-400 hover:text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteProject(projectName);
                      }}
                    />
                  </div>
                </button>
              );
            })}
          </div>
          <button
            id="button-add-project"
            className={`mt-4 flex items-center w-full p-2 rounded hover:bg-gray-700 ${isAddProjectPopupOpen ? "bg-gray-600" : ""}`}
            onClick={() => setIsAddProjectPopupOpen(true)}
          >
            <i className="fas fa-plus mr-2"></i>
            <span>Add Project</span>
          </button>
          <div id="add-project-popup" className={`add-project-popup mt-2 ${isAddProjectPopupOpen ? "block" : "hidden"}`}>
            <form onSubmit={handleSubmitProject(handleAddProject)} className="space-y-2">
              <input
                id="input-add-project-popup"
                type="text"
                {...registerProject("newProjectName")}
                className="w-full p-2 rounded border border-gray-300"
              />
              {projectErrors.newProjectName && (
                <p className="text-red-400 text-sm">{projectErrors.newProjectName.message}</p>
              )}
              <div className="add-project-popup-buttons flex space-x-2">
                <button type="submit" id="button-add-project-popup" className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700">
                  Add
                </button>
                <button
                  type="button"
                  id="button-cancel-project-popup"
                  onClick={() => setIsAddProjectPopupOpen(false)}
                  className="bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-6 ml-0 md:ml-64">
        <div id="project-preview">
          <h1 id="project-name" className="text-3xl font-bold text-gray-800 mb-4">{activeProject}</h1>
          <div className="tasks-list" id="tasks-list">
            {todoList.getProject(activeProject)?.getTasks().map((task) => {
              const taskName = task.getName();
              return (
                <div
                  key={taskName}
                  className="button-task flex justify-between items-center p-3 bg-white rounded shadow mb-2"
                >
                  <div className="left-task-panel flex items-center space-x-2">
                    <i
                      className="far fa-circle text-gray-500 cursor-pointer hover:text-gray-700"
                      onClick={() => handleDeleteTask(taskName)}
                    />
                    {editingTask === taskName ? (
                      <input
                        type="text"
                        defaultValue={taskName}
                        onBlur={(e) => handleRenameTask(taskName, e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") handleRenameTask(taskName, (e.target as HTMLInputElement).value);
                        }}
                        className="input-task-name p-1 border rounded"
                        autoFocus
                      />
                    ) : (
                      <p
                        className="task-content cursor-pointer hover:underline"
                        onClick={() => setEditingTask(taskName)}
                      >
                        {taskName}
                      </p>
                    )}
                  </div>
                  <div className="right-task-panel flex items-center space-x-2">
                    {editingDueDate === taskName ? (
                      <input
                        type="date"
                        onChange={(e) => handleSetTaskDate(taskName, e.target.value)}
                        className="input-due-date p-1 border rounded"
                      />
                    ) : (
                      <p
                        className="due-date text-gray-600 cursor-pointer hover:underline"
                        onClick={() => setEditingDueDate(taskName)}
                      >
                        {task.getDate()}
                      </p>
                    )}
                    <i
                      className="fas fa-times text-red-500 cursor-pointer hover:text-red-700"
                      onClick={() => handleDeleteTask(taskName)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          {activeProject !== "Today" && activeProject !== "This Week" && (
            <>
              <button
                id="button-add-task"
                className={`mt-4 flex items-center p-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 ${isAddTaskPopupOpen ? "bg-indigo-500" : ""}`}
                onClick={() => setIsAddTaskPopupOpen(true)}
              >
                <i className="fas fa-plus mr-2"></i>
                Add Task
              </button>
              <div id="add-task-popup" className={`add-task-popup mt-2 ${isAddTaskPopupOpen ? "block" : "hidden"}`}>
                <form onSubmit={handleSubmitTask(handleAddTask)} className="space-y-2">
                  <input
                    id="input-add-task-popup"
                    type="text"
                    {...registerTask("newTask")}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                  {taskErrors.newTask && (
                    <p className="text-red-400 text-sm">{taskErrors.newTask.message}</p>
                  )}
                  <input
                    type="date"
                    {...registerTask("dateDue")}
                    className="w-full p-2 rounded border border-gray-300"
                  />
                  {taskErrors.dateDue && (
                    <p className="text-red-400 text-sm">{taskErrors.dateDue?.message}</p>
                  )}
                  <div className="add-task-popup-buttons flex space-x-2">
                    <button type="submit" id="button-add-task-popup" className="bg-green-600 text-white py-1 px-3 rounded hover:bg-green-700">
                      Add
                    </button>
                    <button
                      type="button"
                      id="button-cancel-task-popup"
                      onClick={() => setIsAddTaskPopupOpen(false)}
                      className="bg-gray-600 text-white py-1 px-3 rounded hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}