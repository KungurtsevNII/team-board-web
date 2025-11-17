import type { Board } from "./board";
import type { Checklist } from "./checklist";
import type { Column } from "./column";

export interface Task {
    id: string;
    board: Board;
    column: Column
    number: number;
    title: string;
    description?: string;
    tags?: string[];
    checklists?: Checklist[];
}