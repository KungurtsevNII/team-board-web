import type { Board } from "./board";
import type { Checklist } from "./checklist";
import type { Column } from "./column";

export interface Task {
    id: string;
    boardID: string;
    columnID: string
    number: number;
    title: string;
    description?: string;
    tags?: string[];
    checklists?: Checklist[];
}

export interface TaskRequest{
    columnID: string;
    boardID: string;
    title: string;
    description?: string;
    tags?: string[];
    checklists?: Checklist[];
}