
export interface Task {
    id: string;
    boardID: string;
    boardName?: string;
    boardShortName?: string;
    columnID: string
    columnName?: string;
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

export interface Column {
    id: string;
    boardID: string
    orderNum: number;
    name: string;
}

export interface ColumnRequest {
    name: string;
}

export interface Checklist {
    title: string;
    items: ChecklistItem[];
}

export interface ChecklistItem {
    title: string;
    completed: boolean;
}

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

export interface SearchTasksRequest{
    query?: string
    limit?: string
    offset?: string
    filters?: {
        tags?: string[]
    }
}