import type { Column } from "./column";
import type { Task } from "./task";

export interface Board {
    id: string;
    name: string;
    shortName?: string;
    columns?: Column[];
    tasks?: Task[];
}

export interface BoardRequest {
    name: string;
    shortName?: string;
}