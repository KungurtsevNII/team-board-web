import { useCallback, useEffect, useRef } from "react";
import "./SearchModal.css";
import { useTaskContext } from "../../utils/TaskProvider";
import type { Task } from "../../types/types";
import searchIcon from "/src/assets/search.png";
import { Modal } from "../Modal/Modal";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    searchQuery: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onTaskSelect: (task: Task) => void;
}

export const SearchModal = ({ isOpen, onClose, searchQuery, onSearchChange, onTaskSelect }: SearchModalProps) => {
    const taskCtx = useTaskContext();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Escape") {
            onClose();
        }
    }, [onClose]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Поиск задач" iconPath={searchIcon} className="search-modal">
            <div className="search-modal-body-content">
                <input
                    ref={inputRef}
                    className="search-modal-input"
                    type="text"
                    placeholder="Введите запрос..."
                    value={searchQuery}
                    onChange={onSearchChange}
                    onKeyDown={handleKeyDown}
                />
                <div className="search-modal-results-wrapper">
                    {taskCtx.searchedTasks.length === 0 && searchQuery.length > 0 ? (
                        <p className="search-modal-no-results">Ничего не найдено</p>
                    ) : taskCtx.searchedTasks.length === 0 && searchQuery.length === 0 ? (
                        <p className="search-modal-no-results">Начните вводить запрос...</p>
                    ) : (
                        <div className="search-modal-results">
                            {taskCtx.searchedTasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="search-modal-item"
                                    onClick={() => {
                                        onTaskSelect(task);
                                        onClose();
                                    }}
                                >
                                    <div className="search-modal-item-content">
                                        <div className="search-modal-item-title">{task.title}</div>
                                        <div className="search-modal-item-details">
                                            <span className="search-modal-item-board">{task.boardName}</span>
                                            <span className="search-modal-item-column">{task.columnName}</span>
                                        </div>
                                        {task.tags && task.tags.length > 0 && (
                                            <div className="search-modal-item-tags">
                                                {task.tags.map((tag) => (
                                                    <span key={tag} className="search-modal-item-tag">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="search-modal-item-meta">№{task.number}</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Modal>
    );
};

