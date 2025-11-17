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
}


export const TasksColumn = ({
    column,
    tasks,
    boardShortName,
    onTaskColumn,
    onAddColumn,
    onTaskDrop, // dnd
}: TasksColumnProps) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

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
                            {/* <button 
                className="column-menu-item"
                onClick={() => handleAddColumn('right')}
              >
                Создать колонку справай
              </button> */}
                        </div>
                    )}
                </div>
            </div>
            <div className="tasks-column__content">
                {tasks.map(task => (
                    <div
                        key={task.id}
                        draggable
                        onDragStart={e => {
                            e.dataTransfer.setData("text/plain", task.id); // dnd
                        }}
                    >
                        <Task task={task} boardShortName={boardShortName} />
                    </div>
                ))}
            </div>
        </div>
    );
};
