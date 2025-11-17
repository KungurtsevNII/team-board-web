
export interface Checklist {
    title: string;
    items: ChecklistItem[];
}

export interface ChecklistItem {
    title: string;
    completed: boolean;
    // TODO: Add more properties as needed
}
