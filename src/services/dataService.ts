import type { Board } from "../types/board";
import type { Column } from "../types/column";
import type { Task } from "../types/task";

// Интерфейс для сервиса данных
export interface IDataService {
  getBoard(boardId: string): Promise<Board>;
  getBoards(): Promise<Board[]>;
  getColumns(boardId: string): Promise<Column[]>;
  getTasks(boardId: string): Promise<Task[]>;
  getTasksByColumn(columnId: string): Promise<Task[]>;
}

const MOCK_DATA_PATH = "data.json";

// Сервис с моками (для разработки)
export class MockDataService implements IDataService {
  private mockBoard: Board = {
    id: "board-1",
    name: "My Kanban Board",
    shortName: "MKB1",
  };

  private mockBoard2: Board = {
    id: "board-2",
    name: "Board 2 name",
    shortName: "B2N",
  };

  private mockBoard3: Board = {
    id: "board-3",
    name: "IT Board",
    shortName: "ITB",
  };


  private mockColumns: Column[] = [
    {
      id: "column-1",
      board: this.mockBoard,
      orderNum: 1,
      name: "To Do"
    },
    {
      id: "column-2",
      board: this.mockBoard,
      orderNum: 2,
      name: "In Progress"
    },
    {
      id: "column-3",
      board: this.mockBoard,
      orderNum: 3,
      name: "Done"
    }
  ];

  private mockTasks: Task[] = [
    {
      id: "task-1",
      board: this.mockBoard,
      column: this.mockColumns[0],
      number: 1,
      title: "Design new landing page",
      description: "Create mockups",
      tags: ["design", "ui/ux"]
    },
    {
      id: "task-2",
      board: this.mockBoard,
      column: this.mockColumns[0],
      number: 2,
      title: "Write API documentation",
      tags: ["documentation"],
      checklists: [
        {
            title: "Описать сваггер",
            items: [
                {
                    title: "Круды для board",
                    completed: false
                },
                {
                    title: "Круды для task",
                    completed: true
                }
            ]
        },
        {
            title: "Swagger в makefile",
            items: [
                {
                    title: "Описать комады",
                    completed: false
                }
            ]
        }
      ]
    },
    {
      id: "task-4",
      board: this.mockBoard,
      column: this.mockColumns[1],
      number: 4,
      title: "Implement authentication",
      tags: ["backend"]
    }
  ];

  async getBoard(boardId: string): Promise<Board> {
    // Имитируем задержку сети
    // const data = fs.readFileSync('data.json', 'utf8')
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockBoard;
  }

  async getBoards(): Promise<Board[]> {
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 300));
    // return []  
    return [this.mockBoard, this.mockBoard2, this.mockBoard3];
  }

  async getColumns(boardId: string): Promise<Column[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const columns = this.mockColumns.filter(column => column.board.id === boardId);
    return columns;
  }

  async getTasks(boardId: string): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockTasks;
  }

  async getTasksByColumn(columnId: string): Promise<Task[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockTasks.filter(task => task.column.id === columnId);
  }
}

// Сервис с реальным API
export class ApiDataService implements IDataService {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:8080/api/v1") {
    this.baseUrl = baseUrl;
  }

  async getBoard(boardId: string): Promise<Board> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }
    return response.json();
  }

  async getBoards(): Promise<Board[]> {
    // Имитируем задержку сети
    const response = await fetch(`${this.baseUrl}/boards`);
    if (!response.ok) {
      throw new Error("Failed to fetch boards");
    }
    return response.json();
  }

  async getColumns(boardId: string): Promise<Column[]> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/columns`);
    if (!response.ok) {
      throw new Error("Failed to fetch columns");
    }
    return response.json();
  }

  async getTasks(boardId: string): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}/tasks`);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  }

  async getTasksByColumn(columnId: string): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/columns/${columnId}/tasks`);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  }
}

// Фабрика для создания нужного сервиса
export const createDataService = (): IDataService => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === "true" ||
    import.meta.env.DEV;

  if (useMocks) {
    console.log("Using mock data service");
    return new MockDataService();
  } else {
    console.log("Using API data service");
    return new ApiDataService(import.meta.env.VITE_API_URL);
  }
};

// Экспорт singleton экземпляра
export const dataService = createDataService();
