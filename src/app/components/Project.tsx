// src/components/Project.tsx
import { toDate, isToday, isThisWeek, subDays } from "date-fns";
import Task from "./Task";

export default class Project {
  id?: string; // Add ID for GraphQL operations
  name: string;
  tasks: Task[];

  constructor(name: string) {
    this.name = name;
    this.tasks = [];
  }

  setName(name: string): void {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  setTasks(tasks: Task[]): void {
    this.tasks = tasks;
  }

  getTasks(): Task[] {
    return this.tasks;
  }

  getTask(taskName: string): Task | undefined {
    return this.tasks.find((task) => task.getName() === taskName);
  }

  contains(taskName: string): boolean {
    return this.tasks.some((task) => task.getName() === taskName);
  }

  addTask(newTask: Task): void {
    if (this.tasks.find((task) => task.getName() === newTask.name)) return;
    this.tasks.push(newTask);
  }

  deleteTask(taskName: string): void {
    this.tasks = this.tasks.filter((task) => task.name !== taskName);
  }

  getTasksToday(): Task[] {
    return this.tasks.filter((task) => {
      if (task.getDate() === "No date") return false;
      const taskDate = new Date(task.getDateFormatted());
      return isToday(toDate(taskDate));
    });
  }

  getTasksThisWeek(): Task[] {
    return this.tasks.filter((task) => {
      if (task.getDate() === "No date") return false;
      const taskDate = new Date(task.getDateFormatted());
      return isThisWeek(subDays(toDate(taskDate), 1));
    });
  }
}