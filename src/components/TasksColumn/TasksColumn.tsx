import { Task } from "../Task/Task"
import "./TasksColumn.css"
import plus from "/src/assets/plus.png"
import type { Task as TaskType } from "../../types/task";
import type { Column } from "../../types/column";
import { useState, useRef, useEffect } from "react";

interface TasksColumnProps {
    column: Column;
    tasks: TaskType[];
    onTaskColumn: (column: Column) => void;
    onAddColumn: () => void;
    boardShortName?: string;
    onTaskDrop: (taskId: string, targetColumnId: string) => void; // dnd
    onTaskDelete: (taskId: string) => void;
    onTaskEdit: (taskId: string) => void;
    OnTaskDetails: (task: TaskType) => void;
    onDeleteColumn: (column: Column) => void;
    onChecklistChange: (task: TaskType) => void;
    onTagClick: (tag: string) => void;
}


export const TasksColumn = ({
    column,
    tasks,
    boardShortName,
    onTaskColumn,
    onAddColumn,
    onTaskDrop, // dnd
    OnTaskDetails,
    onChecklistChange,
    onDeleteColumn,
    onTagClick,
    onTaskDelete,
    onTaskEdit
}: TasksColumnProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const [taskMenuTaskId, setTaskMenuTaskId] = useState<string | null>(null);
    const taskMenuRef = useRef<HTMLDivElement | null>(null);

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

    const handleAddTask = () => {
        onTaskColumn(column);
        setIsMenuOpen(false);
    };

    const handleAddColumn = () => {
        onAddColumn();
        setIsMenuOpen(false);
    };

    const handleDeleteColumn = () => {
        onDeleteColumn(column);
        setIsMenuOpen(false);
    };


    // dnd: разрешаем drop на всю колонку
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const taskId = e.dataTransfer.getData("text/plain");
        if (!taskId) return;
        onTaskDrop(taskId, column.id);
    };

    const handleSettings = () => {
        console.log("settings");
    };

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
                                onClick={() => handleAddColumn()}
                            >
                                Создать колонку
                            </button>
                            <button
                                className="column-menu-item"
                                onClick={() => handleDeleteColumn()}
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
                            boardShortName={boardShortName}
                            OnTaskDetails={OnTaskDetails}
                            OnChecklistChange={onChecklistChange}
                            onTagClick={onTagClick}
                            onSettingsClick={() => {
                                setTaskMenuTaskId(prev => prev === task.id ? null : task.id);
                            }}
                        />

                        {taskMenuTaskId === task.id && (
                            <div className="task-dropdown-menu" ref={taskMenuRef}>
                                <button
                                    type="button"
                                    className="task-menu-item"
                                    onClick={() => {
                                        onTaskEdit(task.id);
                                        setTaskMenuTaskId(null);
                                    }}
                                >
                                    Редактировать
                                </button>

                                <button
                                    type="button"
                                    className="task-menu-item task-menu-item--danger"
                                    onClick={() => {
                                        onTaskDelete(task.id);
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
