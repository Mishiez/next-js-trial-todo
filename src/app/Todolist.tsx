"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  useRetrieveProjectsQuery,
  useRetrieveProjectTasksQuery,
  useCreateProjectMutation,
  useCreateProjectTaskMutation,
  useDeleteProjectTaskMutation,
  useDeleteProjectMutation,
  useUpdateProjectMutation,
} from "@/lib/generated/graphql";
import {
  LoginForm,
  ProjectForm,
  ProjectList,
  TaskForm,
  Header,
} from "@/app/components";
import { Project, projectSchema, taskSchema } from "@/app/components/types/todo";
import { z } from "zod";

export default function Todolist() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [backendWarning, setBackendWarning] = useState<string | null>(null); // For user feedback
  const { data: projectsData, refetch: refetchProjects } = useRetrieveProjectsQuery();
  const { data: tasksData, refetch: refetchTasks } = useRetrieveProjectTasksQuery({
    variables:
      selectedProjectIndex !== null &&
      projects[selectedProjectIndex] &&
      projects[selectedProjectIndex].id
        ? { projectId: projects[selectedProjectIndex].id }
        : undefined,
    skip:
      selectedProjectIndex === null ||
      !projects[selectedProjectIndex] ||
      !projects[selectedProjectIndex].id,
  });

  const [createProjectMutation] = useCreateProjectMutation();
  const [createTaskMutation] = useCreateProjectTaskMutation();
  const [deleteTaskMutation] = useDeleteProjectTaskMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation();
  const [updateProjectMutation] = useUpdateProjectMutation();

  useEffect(() => {
    const loginStatus = typeof window !== "undefined" ? localStorage.getItem("loggedIn") : null;
    if (loginStatus === "true") {
      setIsLoggedIn(true);
    } else {
      router.push("/login");
    }
  }, [router]);

  useEffect(() => {
    if (projectsData?.retrieveProjects) {
      const transformed = projectsData.retrieveProjects.map((p) => ({
        id: p.id,
        name: p.name,
        status: p.status || "PENDING",
        dateCompleted: p.dateCompleted || null,
        tasks: [],
        completed: p.status === "COMPLETED" || p.dateCompleted != null,
      }));
      setProjects(transformed);
      if (
        selectedProjectIndex !== null &&
        transformed[selectedProjectIndex] &&
        transformed[selectedProjectIndex].id
      ) {
        refetchTasks({
          projectId: transformed[selectedProjectIndex].id,
        });
      }
    }
  }, [projectsData, refetchTasks, selectedProjectIndex]);

  useEffect(() => {
  if (tasksData?.retrieveProjectTasks && selectedProjectIndex !== null) {
    const newTasks = tasksData.retrieveProjectTasks
      .filter((task) => task.project?.id === projects[selectedProjectIndex].id)
      .map((task) => ({
        id: task.id,
        text: task.name || "",
        description: task.description || "",
        dateDue: task.dateDue || "",
        completed: task.dateCompleted != null,
      }));

    const currentTasks = projects[selectedProjectIndex]?.tasks || [];
    const tasksChanged = JSON.stringify(newTasks) !== JSON.stringify(currentTasks);

    if (tasksChanged) {
      const updatedProjects = projects.map((project, index) =>
        index === selectedProjectIndex
          ? { ...project, tasks: newTasks }
          : project
      );
      setProjects(updatedProjects);
    }
  }
}, [tasksData, selectedProjectIndex, projects]);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("loggedIn");
    }
    setIsLoggedIn(false);
    router.push("/login");
  };

  const addProject = async (data: z.infer<typeof projectSchema>) => {
    const dueDate = new Date("2025-12-31T00:00:00.000Z");
    const formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(dueDate.getDate()).padStart(2, "0")} ${String(dueDate.getHours() + 3).padStart(
      2,
      "0"
    )}:${String(dueDate.getMinutes()).padStart(2, "0")}:${String(
      dueDate.getSeconds()
    ).padStart(2, "0")}.000000 +0300`;

    try {
      const response = await createProjectMutation({
        variables: {
          args: {
            name: data.newProjectName,
            description: "Created from frontend",
            dateDue: formattedDate,
          },
        },
      });
      const newProjectId = response.data?.createProject?.id;
      if (newProjectId) {
        setProjects([
          ...projects,
          {
            id: newProjectId,
            name: data.newProjectName,
            status: "PENDING",
            dateCompleted: null,
            tasks: [],
            completed: false,
          },
        ]);
        await refetchProjects();
      }
    } catch (error) {
      console.error("Error creating project:", error);
      setBackendWarning("Failed to create project due to a backend error.");
    }
  };

  const addTask = async (data: z.infer<typeof taskSchema>) => {
    if (selectedProjectIndex === null) return;

    try {
      const selectedProject = projects[selectedProjectIndex];
      if (!selectedProject?.id) {
        console.error("Selected project ID is undefined");
        await refetchProjects();
        return;
      }
      const dueDate = new Date(data.dateDue);
      const formattedDateDue = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(
        2,
        "0"
      )}-${String(dueDate.getDate()).padStart(2, "0")} ${String(dueDate.getHours()).padStart(
        2,
        "0"
      )}:${String(dueDate.getMinutes()).padStart(2, "0")}:${String(
        dueDate.getSeconds()
      ).padStart(2, "0")}.000000 +0300`;

      const response = await createTaskMutation({
        variables: {
          args: {
            name: data.newTask,
            description: data.description,
            projectId: selectedProject.id,
            dateDue: formattedDateDue,
          },
        },
      });
      const newTaskId = response.data?.createProjectTask?.id;
      if (newTaskId) {
        const updatedProjects = projects.map((project, index) =>
          index === selectedProjectIndex
            ? {
                ...project,
                tasks: [
                  ...project.tasks,
                  {
                    id: newTaskId,
                    text: data.newTask,
                    description: data.description,
                    dateDue: data.dateDue,
                    completed: false,
                  },
                ],
              }
            : project
        );
        setProjects(updatedProjects);
        await refetchTasks({ projectId: selectedProject.id });
      }
    } catch (error) {
      console.error("Error creating task:", error);
      setBackendWarning("Failed to create task due to a backend error.");
    }
  };

  const toggleTaskCompletion = (projectIndex: number, taskIndex: number) => {
    const updatedProjects = projects.map((project, pIndex) =>
      pIndex === projectIndex
        ? {
            ...project,
            tasks: project.tasks.map((task, tIndex) =>
              tIndex === taskIndex ? { ...task, completed: !task.completed } : task
            ),
          }
        : project
    );
    setProjects(updatedProjects);
  };

  const toggleProjectCompletion = async (projectIndex: number) => {
    try {
      const project = projects[projectIndex];
      const newCompletedStatus = !project.completed;
      const currentDate = new Date(); // Current time: 05:50 AM EAT, June 01, 2025
      const formattedDateCompleted = `${currentDate.getFullYear()}-${String(
        currentDate.getMonth() + 1
      ).padStart(2, "0")}-${String(currentDate.getDate()).padStart(2, "0")} ${String(
        currentDate.getHours()
      ).padStart(2, "0")}:${String(currentDate.getMinutes()).padStart(2, "0")}:${String(
        currentDate.getSeconds()
      ).padStart(2, "0")}.000000 +0300`;

      // Encode the completion status and timestamp in the description field
      const newDescription = newCompletedStatus
        ? `COMPLETED:${formattedDateCompleted}`
        : "ONGOING";

      // Update the backend using the description field
      await updateProjectMutation({
        variables: {
          args: {
            projectId: project.id,
            description: newDescription,
          },
        },
      });

      // Update the frontend state (optimistically, since backend won't update status/dateCompleted)
      const updatedProjects = projects.map((project, pIndex) =>
        pIndex === projectIndex
          ? {
              ...project,
              completed: newCompletedStatus,
            }
          : project
      );
      setProjects(updatedProjects);

      // Refetch projects to check if the backend updated status/dateCompleted
      await refetchProjects();

      // Warn the user that this is a workaround
      setBackendWarning(
        "Note: Project completion status is encoded in the description field due to backend limitations. This may not fully sync with the backend until the schema is updated."
      );
    } catch (error) {
      console.error("Error updating project completion:", error);
      setBackendWarning("Error updating project completion. Changes may not be saved to the backend.");
    }
  };

  const deleteTask = async (projectIndex: number, taskIndex: number) => {
    try {
      const task = projects[projectIndex].tasks[taskIndex];
      if (!task.id) {
        console.error("Task ID is undefined");
        await refetchProjects();
        return;
      }
      console.log("Deleting task with ID:", task.id); // Log for debugging
      const response = await deleteTaskMutation({
        variables: { taskId: task.id },
      });
      const success = response.data?.deleteProjectTask; // Check the boolean response
      if (success) {
        const updatedProjects = projects.map((project, pIndex) =>
          pIndex === projectIndex
            ? { ...project, tasks: project.tasks.filter((_, tIndex) => tIndex !== taskIndex) }
            : project
        );
        setProjects(updatedProjects);
        await refetchTasks({ projectId: projects[projectIndex].id });
      } else {
        setBackendWarning("Task deletion failed. The backend returned false.");
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      // Type guard to safely access error.message
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setBackendWarning(`Failed to delete task due to a backend error: ${errorMessage}`);
    }
  };

  const deleteProject = async (projectIndex: number) => {
    try {
      const project = projects[projectIndex];
      if (!project.id) {
        console.error("Project ID is undefined");
        await refetchProjects();
        return;
      }
      await deleteProjectMutation({
        variables: { projectId: project.id },
      });
      const updatedProjects = projects.filter((_, pIndex) => pIndex !== projectIndex);
      setProjects(updatedProjects);
      if (selectedProjectIndex === projectIndex) {
        setSelectedProjectIndex(null);
      }
      await refetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
      setBackendWarning(`Failed to delete project due to a backend error: ${errorMessage}`);
    }
  };

  if (!isLoggedIn) {
    return <LoginForm onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-200 to-pink-300 flex flex-col items-center justify-center p-6">
      <Header onLogout={logout} />
      {backendWarning && (
        <div className="bg-yellow-200 text-yellow-800 p-4 rounded-lg mb-4 text-center">
          {backendWarning}
        </div>
      )}
      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-8 border border-yellow-200 transition-shadow hover:shadow-lg">
        <h2 className="text-2xl font-bold text-blue-900 text-center mb-8">
          Your Projects & Tasks
        </h2>
        <div className="flex flex-col gap-6 mb-8">
          <ProjectForm onAddProject={addProject} />
          <TaskForm
            projects={projects}
            selectedProjectIndex={selectedProjectIndex}
            setSelectedProjectIndex={setSelectedProjectIndex}
            onAddTask={addTask}
          />
        </div>
        <ProjectList
          projects={projects}
          onToggleProjectCompletion={toggleProjectCompletion}
          onDeleteProject={deleteProject}
          onToggleTaskCompletion={toggleTaskCompletion}
          onDeleteTask={deleteTask}
        />
      </main>
    </div>
  );
}