'use client';

import { useState, useEffect } from 'react';
import {
  useRetrieveProjectsQuery,
  useRetrieveProjectTasksQuery,
  useCreateProjectMutation,
  useCreateProjectTaskMutation,
  useDeleteProjectTaskMutation,
  useDeleteProjectMutation,
} from '@/lib/generated/graphql';

interface Task {
  id: number;
  text: string;
  completed: boolean;
}

interface Project {
  id: number;
  name: string;
  tasks: Task[];
  completed: boolean;
}

export default function Todolist() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [newTask, setNewTask] = useState('');
  const [selectedProjectIndex, setSelectedProjectIndex] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { data: projectsData, refetch: refetchProjects } = useRetrieveProjectsQuery();
  const { data: tasksData, refetch: refetchTasks } = useRetrieveProjectTasksQuery({
    variables: { projectId: null },
  });

  const [createProjectMutation] = useCreateProjectMutation();
  const [createTaskMutation] = useCreateProjectTaskMutation();
  const [deleteTaskMutation] = useDeleteProjectTaskMutation();
  const [deleteProjectMutation] = useDeleteProjectMutation();

  useEffect(() => {
    const loginStatus = localStorage.getItem('loggedIn');
    if (loginStatus === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (projectsData?.retrieveProjects) {
      console.log('retrieveProjects response:', projectsData.retrieveProjects);
      const transformed = projectsData.retrieveProjects.map((p) => ({
        id: p.id,
        name: p.name,
        tasks: [],
        completed: false,
      }));
      setProjects(transformed);

      transformed.forEach((project) => {
        refetchTasks({ variables: { projectId: project.id } });
      });
    }
  }, [projectsData, refetchTasks]);

  useEffect(() => {
    if (tasksData?.retrieveProjectTasks) {
      console.log('retrieveProjectTasks response:', tasksData.retrieveProjectTasks);
      const updatedProjects = projects.map((project) => {
        const projectTasks = tasksData.retrieveProjectTasks.filter(
          (task) => task.projectId === project.id
        );
        return {
          ...project,
          tasks: projectTasks.map((task) => ({
            id: task.id,
            text: task.name || '',
            completed: task.completed || false,
          })),
        };
      });
      setProjects(updatedProjects);
    }
  }, [tasksData, projects]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email && password) {
      localStorage.setItem('loggedIn', 'true');
      setIsLoggedIn(true);
    }
  };

  const logout = () => {
    localStorage.removeItem('loggedIn');
    setIsLoggedIn(false);
  };

  const addProject = async () => {
    if (newProjectName.trim()) {
      const dueDate = new Date('2025-12-31T00:00:00.000Z');
      const formattedDate = `${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}-${String(dueDate.getDate()).padStart(2, '0')} ${String(dueDate.getHours() + 3).padStart(2, '0')}:${String(dueDate.getMinutes()).padStart(2, '0')}:${String(dueDate.getSeconds()).padStart(2, '0')}.000000 +0300`;

      try {
        const response = await createProjectMutation({
          variables: {
            args: {
              name: newProjectName,
              description: 'Created from frontend',
              dateDue: formattedDate,
            },
          },
        });
        const newProjectId = response.data?.createProject?.id;
        if (newProjectId) {
          setProjects([...projects, { id: newProjectId, name: newProjectName, tasks: [], completed: false }]);
        }
        await refetchProjects();
        setNewProjectName('');
      } catch (error) {
        console.error('Error creating project:', error);
      }
    }
  };

  const addTask = async () => {
    if (newTask.trim() && selectedProjectIndex !== null) {
      try {
        const selectedProject = projects[selectedProjectIndex];
        const response = await createTaskMutation({
          variables: {
            args: {
              name: newTask,
              description: 'Task added from frontend',
              projectId: selectedProject.id,
            },
          },
        });
        const newTaskId = response.data?.createProjectTask?.id || response.data?.createTask?.id;
        console.log('Task creation response:', response.data);
        if (newTaskId) {
          const updatedProjects = projects.map((project, index) =>
            index === selectedProjectIndex
              ? {
                  ...project,
                  tasks: [...project.tasks, { id: newTaskId, text: newTask, completed: false }],
                }
              : project
          );
          setProjects(updatedProjects);
        } else {
          await refetchTasks({ variables: { projectId: selectedProject.id } });
        }
        setNewTask('');
      } catch (error) {
        console.error('Error creating task:', error);
      }
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

  const toggleProjectCompletion = (projectIndex: number) => {
    const updatedProjects = projects.map((project, pIndex) =>
      pIndex === projectIndex ? { ...project, completed: !project.completed } : project
    );
    setProjects(updatedProjects);
  };

  const deleteTask = async (projectIndex: number, taskIndex: number) => {
    try {
      const task = projects[projectIndex].tasks[taskIndex];
      const taskId = task.id;
      console.log('Deleting task with ID:', taskId);
      if (!taskId) {
        console.error('Task ID is undefined, refetching projects...');
        await refetchProjects();
        return;
      }
      await deleteTaskMutation({
        variables: { taskId },
      });
      const updatedProjects = projects.map((project, pIndex) =>
        pIndex === projectIndex
          ? { ...project, tasks: project.tasks.filter((_, tIndex) => tIndex !== taskIndex) }
          : project
      );
      setProjects(updatedProjects);
      await refetchTasks({ variables: { projectId: projects[projectIndex].id } });
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const deleteProject = async (projectIndex: number) => {
    try {
      const projectId = projects[projectIndex].id;
      await deleteProjectMutation({
        variables: { projectId },
      });
      const updatedProjects = projects.filter((_, pIndex) => pIndex !== projectIndex);
      setProjects(updatedProjects);
      if (selectedProjectIndex === projectIndex) {
        setSelectedProjectIndex(null);
      }
      await refetchProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-yellow-100 to-orange-200 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-lg w-full max-w-md transform transition-shadow hover:shadow-xl">
          <h2 className="text-2xl font-bold text-blue-900 text-center mb-6">
            Welcome Back!
          </h2>
          <div className="flex flex-col gap-4">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="w-full p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors placeholder-blue-900 text-blue-900"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors placeholder-blue-900 text-blue-900"
            />
            <button
              onClick={handleLogin}
              className="w-full bg-yellow-400 text-white p-4 rounded-xl border-none cursor-pointer hover:bg-yellow-500 hover:scale-105 transition-all"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-100 via-orange-200 to-pink-300 flex flex-col items-center justify-center p-6">
      <header className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white p-6 rounded-2xl shadow-md w-full max-w-2xl mb-8 text-center">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Todo Adventure
        </h1>
        <p className="text-sm mt-2 text-orange-50">
          Current Time: {new Date().toLocaleString('en-US', { timeZone: 'Africa/Nairobi' })}
        </p>
        <button
          onClick={logout}
          className="mt-4 bg-white text-blue-900 px-5 py-2 rounded-full border-none cursor-pointer hover:bg-yellow-100 hover:scale-105 transition-all"
        >
          Log Out
        </button>
      </header>

      <main className="w-full max-w-2xl bg-white rounded-3xl shadow-md p-8 border border-yellow-100 transition-shadow hover:shadow-lg">
        <h2 className="text-2xl font-bold text-blue-900 text-center mb-8">
          Your Projects & Tasks
        </h2>

        <div className="flex flex-col gap-6 mb-8">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="Add a new project..."
              className="flex-1 p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors placeholder-black text-gray-900"
            />
            <button
              onClick={addProject}
              disabled={!newProjectName.trim()}
              className={`p-3 bg-green-600 text-white rounded-xl border-none transition-all ${
                newProjectName.trim()
                  ? 'cursor-pointer hover:bg-green-700 hover:scale-105'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Add Project
            </button>
          </div>

          <div className="flex flex-col gap-3">
            <select
              value={selectedProjectIndex ?? ''}
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
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              disabled={selectedProjectIndex === null}
              className={`flex-1 p-4 border border-yellow-200 rounded-xl outline-none focus:border-yellow-400 transition-colors placeholder-black text-gray-900 ${
                selectedProjectIndex === null ? 'opacity-50 cursor-not-allowed' : 'cursor-text'
              }`}
            />
            <button
              onClick={addTask}
              disabled={selectedProjectIndex === null || !newTask.trim()}
              className={`p-3 bg-blue-500 text-white rounded-xl border-none transition-all ${
                selectedProjectIndex !== null && newTask.trim()
                  ? 'cursor-pointer hover:bg-blue-600 hover:scale-105'
                  : 'bg-gray-400 cursor-not-allowed'
              }`}
            >
              Add Task
            </button>
          </div>
        </div>

        {projects.length === 0 ? (
          <p className="text-blue-900 text-center p-6 bg-yellow-100 rounded-xl">
            No projects yet! Start by adding one above.
          </p>
        ) : (
          projects.map((project, pIndex) => (
            <div
              key={pIndex}
              className="bg-yellow-100 rounded-xl p-4 mb-6 shadow-sm"
            >
              <div className="flex flex-col items-center justify-between mb-4 gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={project.completed}
                    onChange={() => toggleProjectCompletion(pIndex)}
                    className="h-5 w-5 accent-green-600 border-yellow-200 rounded"
                  />
                  <h3
                    className={`text-xl font-semibold ${
                      project.completed ? 'text-gray-400 line-through' : 'text-black'
                    }`}
                  >
                    {project.name}
                  </h3>
                </div>
                <button
                  onClick={() => deleteProject(pIndex)}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-red-600 hover:scale-105 transition-all"
                >
                  Delete Project
                </button>
              </div>
              {project.tasks.length === 0 ? (
                <p className="text-blue-900 italic text-center">
                  No tasks yet. Add some above!
                </p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {project.tasks.map((task, tIndex) => (
                    <li
                      key={tIndex}
                      className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={() => toggleTaskCompletion(pIndex, tIndex)}
                          className="h-5 w-5 accent-green-600 border-yellow-200 rounded"
                        />
                        <span
                          className={task.completed ? 'text-gray-400 line-through' : 'text-blue-900'}
                        >
                          {task.text}
                        </span>
                      </div>
                      <button
                        onClick={() => deleteTask(pIndex, tIndex)}
                        className="bg-red-500 text-white px-4 py-2 rounded-lg border-none cursor-pointer hover:bg-red-600 hover:scale-105 transition-all"
                      >
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))
        )}
      </main>
    </div>
  );
}