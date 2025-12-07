import { Task } from "../Task/Task"
import "./TasksColumn.css"
import plus from "/src/assets/plus.png"
import type { 
    Column, Task as TaskType
} from "../../types/types"
import { useState, useRef, useEffect, useCallback } from "react";
import { useTaskContext } from "../../utils/TaskProvider";
import { useBoardContext } from "../../utils/BoardProvider";

interface TasksColumnProps {
    column: Column;
    tasks: TaskType[];
    onAddTask: () => void;
    onAddColumn: () => void;
    onTaskDrop: (taskId: string, targetColumnId: string) => void; // dnd
    onTagClick: (tag: string) => void;
}


export const TasksColumn = ({
    column,
    tasks,
    onAddTask,
    onAddColumn,
    onTaskDrop,
    onTagClick,
}: TasksColumnProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [taskMenuTaskId, setTaskMenuTaskId] = useState<string | null>(null);
    const taskMenuRef = useRef<HTMLDivElement | null>(null);

    const taskCtx = useTaskContext();
    const boardCtx = useBoardContext();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
            if (taskMenuRef.current && !taskMenuRef.current.contains(event.target as Node)) {
                setTaskMenuTaskId(null);
            }
        };

        if (isMenuOpen || taskMenuTaskId) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen, taskMenuTaskId]);


    // предотвращаем выпадение меню
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        if (isMenuOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isMenuOpen]);

    const handleAddTask = useCallback(() => {
        // onTaskColumn(column);
        onAddTask()
        setIsMenuOpen(false);
    }, []);

    const handleAddColumn = useCallback(() => {
        // boardCtx.setIsAddColumnProcess(true)
        onAddColumn();
        setIsMenuOpen(false);
    }, []);

    const handleDeleteColumn = useCallback(() => {
        boardCtx.deleteColumn(column.id);
    }, []);

    const handleDeleteTask = useCallback((taskId: string) => {
        taskCtx.deleteTask(taskId);
    }, [taskCtx]);


    // dnd: разрешаем drop на всю колонку
    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");
        if (!taskId) return;
        onTaskDrop(taskId, column.id);
    }, [onTaskDrop]);

    return (
        <div className="tasks-column" onDragOver={handleDragOver} // dnd
            onDrop={handleDrop}        >
            <div className="tasks-column__header">
                <h3>{column.name}</h3>
                <div className="column-menu-wrapper" ref={menuRef}>
                    <img
                        src={plus}
                        alt="Добавить"
                        className="plus_icon"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    />
                    {isMenuOpen && (
                        <div className="column-dropdown-menu">
                            <button
                                className="column-menu-item"
                                onClick={handleAddTask}
                            >
                                Добавить задачу
                            </button>
                            <button
                                className="column-menu-item"
                                onClick={handleAddColumn}
                            >
                                Создать колонку
                            </button>
                            <button
                                className="column-menu-item"
                                onClick={handleDeleteColumn}
                                style={{ color: "red" }}
                            >
                                Удалить колонку
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <div className="tasks-column__content">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        className="task-wrapper"
                        draggable
                        onDragStart={(e) => {
                            e.dataTransfer.setData("text/plain", task.id);
                        }}
                    >
                        <Task
                            task={task}
                            onTagClick={onTagClick}
                            onSettingsClick={() => {
                                setTaskMenuTaskId(prev => prev === task.id ? null : task.id);
                            }}
                        />

                        {taskMenuTaskId === task.id && (
                            <div className="task-dropdown-menu" ref={taskMenuRef}>
                                {/* <button
                                    type="button"
                                    className="task-menu-item"
                                >
                                    Редактировать
                                </button> */}

                                <button
                                    type="button"
                                    className="task-menu-item task-menu-item--danger"
                                    onClick={() => {
                                        handleDeleteTask(task.id);
                                        setTaskMenuTaskId(null);
                                    }}
                                >
                                    Удалить задачу
                                </button>
                            </div>
                        )}
                    </div>
                ))}


            </div>
        </div>
    );
};
