import type { Board } from "./board";

export interface Column {
    id: string;
    board: Board
    orderNum: number;
    name: string;
}