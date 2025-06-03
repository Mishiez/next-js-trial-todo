// src/components/Task.tsx
export default class Task {
  id?: string; // Add ID for GraphQL operations
  name: string;
  dueDate: string;

  constructor(name: string, dueDate: string = "No date") {
    this.name = name;
    this.dueDate = dueDate;
  }

  setName(name: string): void {
    this.name = name;
  }

  getName(): string {
    return this.name;
  }

  setDate(dueDate: string): void {
    this.dueDate = dueDate;
  }

  getDate(): string {
    return this.dueDate;
  }

  getDateFormatted(): string {
    if (this.dueDate === "No date") return this.dueDate;
    const [day, month, year] = this.dueDate.split("/");
    return `${month}/${day}/${year}`;
  }
}