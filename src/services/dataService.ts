import type {
  Board, BoardRequest, Column, ColumnRequest, SearchTasksRequest, Task, TaskRequest
} from "../types/types"

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
  deleteTask(taskId: string): Promise<void>;
  deleteColumn(columnId: string): Promise<void>;
  deleteBoard(boardId: string): Promise<void>;
  searchTasks(searchTaskReq: SearchTasksRequest): Promise<Task[]>;
}
//TODO возвращать нормальные ошибки тут (на вывод фронт)

// Сервис с реальным API
export class ApiDataService implements IDataService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    if (baseUrl == "") {
      throw new Error("baseUrl is required")
    }
    this.baseUrl = baseUrl;
  }

  async createColumn(boardID: string, columnData: ColumnRequest): Promise<Column> {
    const response = await fetch(`${this.baseUrl}/boards/${boardID}/columns`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': '123e4567-e89b-12d3-a456-426655440000',
      },
      body: JSON.stringify({
        name: columnData.name,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create column");
    }

    const data = await response.json();

    const column: Column = {
      id: data.id,
      boardID: data.board_id,
      orderNum: data.order_num,
      name: data.name,
    };

    return column;
  }

  async createTask(task: TaskRequest): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': '123e4567-e89b-12d3-a456-426655440000',
      },
      body: JSON.stringify({
        column_id: task.columnID,
        board_id: task.boardID,
        title: task.title,
        description: task.description,
        tags: task.tags,
        checklists: task.checklists?.map((checklist) => ({
          title: checklist.title,
          items: checklist.items?.map((item) => ({
            title: item.title,
            completed: item.completed,
          })) || [],
        })) || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create task");
    }

    const data = await response.json();

    const newTask: Task = {
      id: data.id,
      boardID: data.board_id,
      columnID: data.column_id,
      number: data.number,
      title: data.title,
      description: data.description,
      tags: data.tags,
      checklists: data.checklists?.map((checklist: any) => ({
        title: checklist.title,
        items: checklist.items?.map((item: any) => ({
          title: item.title,
          completed: item.completed,
        })) || [],
      })) || [],
    };

    return newTask;
  }


  async createBoard(board: BoardRequest): Promise<Board> {
    const response = await fetch(`${this.baseUrl}/boards`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: board.name,
        short_name: board.shortName,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to create board");
    }

    const data = await response.json();

    const newBoard: Board = {
      id: data.id,
      name: data.name,
      shortName: data.short_name,
      columns: data.columns?.map((col: any) => ({
        id: col.id,
        boardID: col.board_id,
        orderNum: col.order_num,
        name: col.name,
      })) || [],
      tasks: data.tasks?.map((task: any) => ({
        id: task.id,
        boardID: task.board_id,
        columnID: task.column_id,
        number: task.number,
        title: task.title,
        description: task.description,
        tags: task.tags,
        checklists: task.checklists?.map((checklist: any) => ({
          title: checklist.title,
          items: checklist.items?.map((item: any) => ({
            title: item.title,
            completed: item.completed,
          })) || [],
        })) || [],
      })) || [],
    };

    return newBoard;
  }

  async getBoard(boardId: string): Promise<Board> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': '123e4567-e89b-12d3-a456-426655440000',
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }

    let data = await response.json();
    data = data.data

    const board: Board = {
      id: data.id,
      name: data.name,
      shortName: data.short_name,
      columns: data.columns?.map((col: any) => ({
        id: col.id,
        boardID: col.board_id,
        orderNum: col.order_num,
        name: col.name,
      })) || [],
      tasks: data.tasks?.map((task: any) => ({
        id: task.id,
        boardID: task.board_id,
        columnID: task.column_id,
        number: task.number,
        title: task.title,
        description: task.description,
        tags: task.tags,
        checklists: task.checklists?.map((checklist: any) => ({
          title: checklist.title,
          items: checklist.items?.map((item: any) => ({
            title: item.title,
            completed: item.completed,
          })) || [],
        })) || [],
      })) || [],
    };

    return board;
  }


  async getBoards(): Promise<Board[]> {
    const response = await fetch(`${this.baseUrl}/boards`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': "123e4567-e89b-12d3-a456-426655440000"
      },
    })
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }
    const rawBoards = await response.json();
    const boards: Board[] = rawBoards.boards.map((board: any) => ({
      id: board.id,
      name: board.name,
      shortName: board.short_name,
      columns: [],
      tasks: [],
    }));

    return boards;
  }

  async getTask(taskID: string): Promise<Task> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-ID': '123e4567-e89b-12d3-a456-426655440000',
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch task");
    }

    const data = await response.json();

    const task: Task = {
      id: data.id,
      boardID: data.board_id,
      columnID: data.column_id,
      number: data.number,
      title: data.title,
      description: data.description,
      tags: data.tags,
      checklists: data.checklists?.map((checklist: any) => ({
        title: checklist.title,
        items: checklist.items?.map((item: any) => ({
          title: item.title,
          completed: item.completed,
        })) || [],
      })) || [],
    };

    return task;
  }


  async moveTask(taskId: string, columnID: string): Promise<Task> {
    // throw Error("not implemented");
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}/move`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ "column_id" : columnID })
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
      body: JSON.stringify({
        column_id: task.columnID,
        board_id: task.boardID,
        title: task.title,
        description: task.description,
        tags: task.tags,
        checklists: task.checklists?.map((checklist) => ({
          title: checklist.title,
          items: checklist.items?.map((item) => ({
            title: item.title,
            completed: item.completed,
          })) || [],
        })) || undefined,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to move tasks");
    }

    const data = await response.json();

    const tsk: Task = {
      id: data.id,
      boardID: data.board_id,
      columnID: data.column_id,
      number: data.number,
      title: data.title,
      description: data.description,
      tags: data.tags,
      checklists: data.checklists?.map((checklist: any) => ({
        title: checklist.title,
        items: checklist.items?.map((item: any) => ({
          title: item.title,
          completed: item.completed,
        })) || [],
      })) || [],
    };

    return tsk;
  }


  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  }

  async deleteColumn(columnId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/columns/${columnId}`, {
      method: 'DELETE',
    })

    if (response.status === 409) {
      throw new Error("Not empty");
    }
    if (!response.ok) {
      throw new Error("Failed to delete column");
    }

  }

  async deleteBoard(boardId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  }

  async searchTasks(searchTaskReq: SearchTasksRequest): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/tasks/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchTaskReq)
    })
    if (!response.ok) {
      throw new Error("Failed to search tasks");
    }

    const resp = await response.json();
    const tasks: Task[] = resp.map(
      (task: any) => ({
        id: task.id,
        boardID: task.board_id,
        columnID: task.column_id,
        number: task.number,
        title: task.title,
      })
    )
    return tasks
  }
}



// Тестовый сервер
export class ApiTestDataService implements IDataService {
  private baseUrl: string;

  constructor(baseUrl: string) {
    if (baseUrl == "") {
      throw new Error("baseUrl is required")
    }
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
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }

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
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }

    return response.json();
  }

  async getBoard(boardId: string): Promise<Board> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch board");
    }
    const resp: Board = await response.json()
    console.log(resp)
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
      throw new Error("Failed to update tasks");
    }
    return response.json();
  }

  async deleteTask(taskId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/tasks/${taskId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  }

  async deleteColumn(columnId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/columns/${columnId}`, {
      method: 'DELETE',
    })
    let resp
    try {
      resp = await response.json()
    } catch { }

    if (resp?.error === "column is not empty") {
      throw new Error("Not empty");
    }
    if (!response.ok) {
      throw new Error("Failed to delete column");
    }

  }

  async deleteBoard(boardId: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/boards/${boardId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error("Failed to delete task");
    }
  }

  async searchTasks(searchTaskReq: SearchTasksRequest): Promise<Task[]> {
    const response = await fetch(`${this.baseUrl}/tasks/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(searchTaskReq)
    })
    if (!response.ok) {
      throw new Error("Failed to search tasks");
    }
    return response.json()
  }
}

// Фабрика для создания нужного сервиса
export const createDataService = (): IDataService => {
  const useMocks = import.meta.env.VITE_USE_MOCKS === "true"

  if (useMocks) {
    console.log("Using mock data service ", import.meta.env.VITE_API_TEST_URL);
    return new ApiTestDataService(import.meta.env.VITE_API_TEST_URL);
  } else {
    console.log("Using API data service");
    return new ApiDataService(import.meta.env.VITE_API_URL);
  }
};

// Экспорт singleton экземпляра
export const dataService = createDataService();
