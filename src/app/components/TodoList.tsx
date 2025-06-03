// src/app/components/TodoList.tsx
import { compareAsc, toDate } from "date-fns";
import Project from "./Project";
import Task from "./Task";

export default class TodoList {
  projects: Project[];

  constructor() {
    this.projects = [
      new Project("Inbox"),
      new Project("Today"),
      new Project("This Week"),
    ];
  }

  setProjects(projects: Project[]): void {
    this.projects = projects;
  }

  getProjects(): Project[] {
    return this.projects;
  }

  getProject(projectName: string): Project | undefined {
    return this.projects.find((project) => project.getName() === projectName);
  }

  contains(projectName: string): boolean {
    return this.projects.some((project) => project.getName() === projectName);
  }

  addProject(newProject: Project): void {
    if (this.projects.find((project) => project.getName() === newProject.name))
      return;
    this.projects.push(newProject);
  }

  deleteProject(projectName: string): void {
    const projectToDelete = this.projects.find(
      (project) => project.getName() === projectName
    );
    if (projectToDelete) {
      this.projects.splice(this.projects.indexOf(projectToDelete), 1);
    }
  }

  updateTodayProject(): void {
    const todayProject = this.getProject("Today");
    if (todayProject) {
      todayProject.tasks = [];
      this.projects
        .filter((p) => p.getName() !== "Today" && p.getName() !== "This Week")
        .forEach((project) => {
          project.getTasksToday().forEach((task) => {
            const taskName = `${task.getName()} (${project.getName()})`;
            todayProject.addTask(new Task(taskName, task.getDate()));
          });
        });
    }
  }

  updateWeekProject(): void {
    const weekProject = this.getProject("This Week");
    if (weekProject) {
      weekProject.tasks = [];
      this.projects
        .filter((p) => p.getName() !== "Today" && p.getName() !== "This Week")
        .forEach((project) => {
          project.getTasksThisWeek().forEach((task) => {
            const taskName = `${task.getName()} (${project.getName()})`;
            weekProject.addTask(new Task(taskName, task.getDate()));
          });
        });

      weekProject.setTasks(
        weekProject
          .getTasks()
          .sort((taskA, taskB) =>
            compareAsc(
              toDate(new Date(taskA.getDateFormatted())),
              toDate(new Date(taskB.getDateFormatted()))
            )
          )
      );
    }
  }
}