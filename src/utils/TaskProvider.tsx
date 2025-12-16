// contexts/TaskContext.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { SearchTasksRequest, Task, TaskRequest } from '../types/types';
import { dataService } from '../services/dataService';

interface TaskContextType {
	tasks: Task[];
	loading: boolean;
	error: string | null;
	searchedTasks: Task[];
	setError: (error: string | null) => void;
	setTasks: (tasks: Task[]) => void;
	addTask: (task: TaskRequest) => void;
	deleteTask: (taskId: string) => void;
	moveTask: (taskId: string, targetColumnId: string) => Promise<void>;
	updateTask: (task: Task) => Promise<boolean>;
	fetchTaskDetails: (taskId: string) => Promise<Task | null>;
	searchTasks: (searchTaskReq: SearchTasksRequest) => Promise<Task[]>;

	expandedTaskId: string | null;
	setExpandedTaskId: (taskId: string | null) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider = ({ children }: { children: ReactNode }) => {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [searchedTasks, setSearchedTasks] = useState<Task[]>([]);

	const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

	const addTask = useCallback(async (task: TaskRequest) => {
		// setError("Не заполнено")
		// setTasks(prev => [...prev, task]);
		setLoading(true);
		try {
			const resp = await dataService.createTask(task);
			setTasks(prev => [...prev, resp]);
		} catch (e) {
			console.error(e);
			setError('Ошибка при добавлении задачи');
		} finally {
			setLoading(false);
		}
	}, []);

	const deleteTask = useCallback(async (taskId: string) => {
		try {
			await dataService.deleteTask(taskId);
			setTasks(prev => prev.filter(t => t.id !== taskId));
		} catch (e) {
			console.error(e);
			setError('Ошибка при удалении задачи');
		}
	}, []);

	const moveTask = useCallback(async (taskId: string, targetColumnId: string) => {
		let oldColumnId: string | undefined;

		setTasks(prev => {
			const task = prev.find(t => t.id === taskId);
			if (task) oldColumnId = task.columnID;
			return prev.map(t =>
				t.id === taskId ? { ...t, columnID: targetColumnId } : t
			);
		});

		try {
			await dataService.moveTask(taskId, targetColumnId);
			// Просто не перезаписываем - оптимистичное обновление уже сработало
			// Если нужны другие поля от сервера - добавь их явно
		} catch (e) {
			console.error(e);
			setError('Ошибка при перемещении задачи');
			if (oldColumnId) {
				setTasks(prev =>
					prev.map(t =>
						t.id === taskId ? { ...t, columnID: oldColumnId! } : t
					)
				);
			}
		} finally {
			setLoading(false);
		}
	}, []);



	const updateTask = useCallback(async (task: Task) => {
		// setError("Не заполнено")
		// return false
		setLoading(true);
		try {
			// var tsk = await dataService.getTask(task.id)
			var tsk = await dataService.updateTask(task)
			setTasks(prev => prev.map(t => t.id === task.id ? tsk : t));
			return true
		} catch (e) {
			console.error(e);
			setError('Ошибка при обновлении задачи');
		} finally {
			setLoading(false);
		}
		return false
	}, []);

	const fetchTaskDetails = useCallback(async (taskId: string): Promise<Task | null> => {
		setLoading(true);
		try {
			const task = await dataService.getTask(taskId)
			setTasks(prev => prev.map(t => t.id === taskId ? task : t));
			return task;
		} catch (e) {
			console.error(e);
			setError('Ошибка при получении задачи');
		} finally {
			setLoading(false);
		}
		return null
	}, []);

	const searchTasks = useCallback(async (searchTaskReq: SearchTasksRequest): Promise<Task[]> => {
		setLoading(true);
		try {
			const tasks = await dataService.searchTasks(searchTaskReq)
			setSearchedTasks(tasks);
			return tasks;
		} catch (e) {
			console.error(e);
			setError('Ошибка при поиске задачи');
		} finally {
			setLoading(false);
		}
		return []
	}, [])

	return (
		<TaskContext.Provider
			value={{
				tasks,
				loading,
				error,
				searchedTasks,
				setError,
				setTasks,
				addTask,
				deleteTask,
				moveTask,
				updateTask,
				fetchTaskDetails,
				searchTasks,
				expandedTaskId,
				setExpandedTaskId,
			}}
		>
			{children}
		</TaskContext.Provider>
	);
};

export const useTaskContext = () => {
	const context = useContext(TaskContext);
	if (!context) throw new Error('useTaskContext must be used within TaskProvider');
	return context;
};
