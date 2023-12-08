export interface Todo {
    id: number | null;
    createdByUserId: number | null;
    createdByUsername: string;
    name: string;
    description: string;
    isCompleted: boolean;
    completionDate: Date | null;
  }