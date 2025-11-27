import type { Board } from "./board";

export interface Column {
    id: string;
    boardID: string
    orderNum: number;
    name: string;
}

export interface ColumnRequest {
    name: string;
}