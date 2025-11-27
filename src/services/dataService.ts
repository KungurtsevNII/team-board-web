import type { Board, BoardRequest } from "../types/board";
import type { Column, ColumnRequest } from "../types/column";
import type { Task, TaskRequest } from "../types/task";

// Интерфейс для сервиса данных
export interface IDataService {
  createColumn(boaidID: string, column: ColumnRequest): Promise<Column>;
  createTask(task: TaskRequest): Promise<Task>;
  createBoard(board: BoardRequest): Promise<Board>;
  getBoard(boardId: string): Promise<Board>;
  getBoards(): Promise<Board[]>;
  getTask(taskId: string): Promise<Task>;
  moveTask(taskId: string, columnID: string): Promise<Task>;
  updateTask(task: Task): Promise<Task>;
}

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
      boardID: this.mockBoard.id,
      orderNum: 1,
      name: "To Do"
    },
    {
      id: "column-2",
      boardID: this.mockBoard.id,
      orderNum: 2,
      name: "In Progress"
    },
    {
      id: "column-3",
      boardID: this.mockBoard.id,
      orderNum: 3,
      name: "Done"
    }
  ];

  private mockTasks: Task[] = [
    {
      id: "task-1",
      boardID: this.mockBoard.id,
      columnID: this.mockColumns[0].id,
      number: 1,
      title: "Design new landing page",
      description: "Create mockups",
      tags: ["design", "ui/ux"]
    },
    {
      id: "task-2",
      boardID: this.mockBoard.id,
      columnID: this.mockColumns[0].id,
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
      boardID: this.mockBoard.id,
      columnID: this.mockColumns[1].id,
      number: 4,
      title: "Implement authentication",
      tags: ["backend"]
    }
  ];

  async createColumn(boaidID: string, column: ColumnRequest): Promise<Column> {
    return this.mockColumns[0];
  }

  async createTask(task: TaskRequest): Promise<Task> {
    return this.mockTasks[0];
  }

  async createBoard(board: BoardRequest): Promise<Board> {
    return this.mockBoard;
  }

  async getBoard(boardId: string): Promise<Board> {
    // Имитируем задержку сети
    // const data = fs.readFileSync('data.json', 'utf8')
    await new Promise(resolve => setTimeout(resolve, 300));
    this.mockBoard.columns = this.mockColumns.filter(column => column.boardID === boardId);
    // this.mockBoard.tasks = this.mockTasks.filter(task => task.column.id === columnId);
    this.mockBoard.tasks = this.mockTasks;
    return this.mockBoard;
  }

  async getBoards(): Promise<Board[]> {
    // Имитируем задержку сети
    await new Promise(resolve => setTimeout(resolve, 300));
    return [this.mockBoard, this.mockBoard2, this.mockBoard3];
  }

  async moveTask(taskId: string, columnID: string): Promise<Task> {
    return this.mockTasks[0]
  }

  async getTask(taskID: string): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.mockTasks[0];
  }

  async updateTask(task: Task): Promise<Task> {
    return task;
  }
}

// Сервис с реальным API
export class ApiDataService implements IDataService {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:8080/api/v1") {
    this.baseUrl = baseUrl;
  }

  async createColumn(boaidID: string, column: ColumnRequest): Promise<Column> {
    const response = await fetch(`${this.baseUrl}/boards/${boaidID}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(column)
    })
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }
    return response.json();
  }

  async createTask(task: TaskRequest): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    })

    return response.json();
  }

  async createBoard(board: BoardRequest): Promise<Board> {
    const response = await fetch(`${this.baseUrl}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(board)
    })

    return response.json();
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
    // const response = await fetch(`${this.baseUrl}/boards`);
    // if (!response.ok) {
    //   throw new Error("Failed to fetch boards");
    // }

    console.log("DADAD")
    const response = await fetch(`${this.baseUrl}/boards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({user_id: "48034ba8-bd52-435e-8b77-1d3c5c0c01c5"})
    })
    return response.json();
  }

  async getTask(taskID: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskID}`);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  }

  async moveTask(taskId: string, columnID: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ columnID })
    })

    if (!response.ok) {
      throw new Error("Failed to move tasks");
    }
    return response.json();
  }
  async updateTask(task: Task): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    })

    if (!response.ok) {
      throw new Error("Failed to move tasks");
    }
    return response.json();
  }

}




export class ApiTestDataService implements IDataService {
  private baseUrl: string;

  constructor(baseUrl: string = "http://localhost:8079/api/v1") {
    this.baseUrl = baseUrl;
  }

  async createColumn(boaidID: string, column: ColumnRequest): Promise<Column> {
    const response = await fetch(`${this.baseUrl}/boards/${boaidID}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(column)
    })
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }
    return response.json();
  }

  async createTask(task: TaskRequest): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    })

    return response.json();
  }

  async createBoard(board: BoardRequest): Promise<Board> {
    const response = await fetch(`${this.baseUrl}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(board)
    })

    return response.json();
  }

  async getBoard(boardId: string): Promise<Board> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }
    const resp: Board = await response.json()
    return resp;
  }

  async getBoards(): Promise<Board[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const response = await fetch(`${this.baseUrl}/boards`);
    if (!response.ok) {
      throw new Error("Failed to fetch boards");
    }
    const boards = await response.json();
    const resp = boards["boards"]
    return resp;
  }

  async getTask(taskID: string): Promise<Task> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const response = await fetch(`${this.baseUrl}/tasks/${taskID}`);
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  }

  async moveTask(taskId: string, columnID: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/move`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ columnID })
    })

    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return response.json();
  }

  async updateTask(task: Task): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(task)
    })

    if (!response.ok) {
      throw new Error("Failed to move tasks");
    }
    return response.json();
  }
}

// Фабрика для создания нужного сервиса
export const createDataService = (): IDataService => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === "true"

  if (useMocks) {
    console.log("Using mock data service");
    return new ApiTestDataService();
  } else {
    console.log("Using API data service");
    return new ApiDataService(import.meta.env.VITE_API_URL);
  }
};

// Экспорт singleton экземпляра
export const dataService = createDataService();
