import { useState } from "react";
import { Modal } from "../Modal/Modal";
import "./ExternalForms.css"
import type { Checklist, ChecklistItem, Column, TaskRequest } from "../../types/types";

import humanIcon from "/src/assets/human.png"
import boardIcon from "/src/assets/board.png"
import taskIcon from "/src/assets/task.png"
import columnIcon from "/src/assets/column.png"

interface ExternalFormsProps {
    // Board modal
    isBoardModalOpen: boolean;
    onCloseBoardModal: () => void;
    onSubmitBoard: (e: React.FormEvent<HTMLFormElement>) => void;

    // Task modal
    isTaskModalOpen: boolean;
    onCloseTaskModal: () => void;
    onSubmitTask: (e: React.FormEvent<HTMLFormElement>) => void;
    taskColumn: Column | null;
    activeBoardId: string;

    // Column modal
    isColumnModalOpen: boolean;
    onCloseColumnModal: () => void;
    onSubmitColumn: (e: React.FormEvent<HTMLFormElement>) => void;

    // User modal
    userModalOpen: boolean;
    onCloseUserModal: () => void;
}

export const ExternalForms = ({
    isBoardModalOpen,
    onCloseBoardModal,
    onSubmitBoard,
    isTaskModalOpen,
    onCloseTaskModal,
    onSubmitTask,
    taskColumn,
    activeBoardId,
    isColumnModalOpen,
    onCloseColumnModal,
    onSubmitColumn,
    userModalOpen,
    onCloseUserModal,
}: ExternalFormsProps) => {

    const [modalChecklists, setModalChecklists] = useState<Checklist[]>([]);
    const [currentChecklistTitle, setCurrentChecklistTitle] = useState<string>('');
    const [currentChecklistItems, setCurrentChecklistItems] = useState<ChecklistItem[]>([]);
    const [newItemTitle, setNewItemTitle] = useState<string>('');

    const handleCloseTaskModal = () => {
        setModalChecklists([]);
        setCurrentChecklistTitle('');
        setCurrentChecklistItems([]);
        setNewItemTitle('');
        onCloseTaskModal();
    };

    const handleSubmitTask = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!taskColumn || !activeBoardId) {
            console.error('taskColumn or activeBoardId is missing');
            return;
        }

        const form = e.target as HTMLFormElement;
        const taskName = form.elements.namedItem('task-name') as HTMLInputElement;
        const taskDesc = form.elements.namedItem('task-description') as HTMLInputElement;
        const taskTags = form.elements.namedItem('task-tags') as HTMLInputElement;

        const splitedTags = taskTags.value.split(' ').map((t) => t.trim()).filter(t => t);

        const taskData: TaskRequest = {
            title: taskName.value,
            description: taskDesc.value,
            boardID: activeBoardId,
            tags: splitedTags,
            columnID: taskColumn.id,
            checklists: modalChecklists,
        };

        (e.target as any).taskData = taskData;

        onSubmitTask(e);

        handleCloseTaskModal();
    };


    return (
        <>
            {/* ===== BOARD MODAL ===== */}

            {isBoardModalOpen &&
                <Modal
                    isOpen={isBoardModalOpen}
                    onClose={onCloseBoardModal}
                    title="Создать доску"
                    iconPath={boardIcon}>
                    <form
                        className="modal-form"
                        onSubmit={onSubmitBoard}
                    >
                        <div className="modal-row">
                            <label htmlFor="board-name">Название доски</label>
                            <input type="text" id="board-name" name="board-name" required />
                        </div>
                        <div className="modal-row">
                            <label htmlFor="board-short-name">Сокращенное название</label>
                            <input type="text" id="board-short-name" name="board-short-name" />
                        </div>
                        <div className="modal-button-field">
                            <button className="modal-button">
                                Создать
                            </button>
                        </div>
                    </form>
                </Modal>
            }

            {/* ===== TASK MODAL ===== */}

            {isTaskModalOpen &&
                <Modal
                    isOpen={isTaskModalOpen}
                    onClose={handleCloseTaskModal}
                    title="Новая задача"
                    iconPath={taskIcon}
                >
                    <form className="modal-form" onSubmit={handleSubmitTask}>
                        <div className="modal-row">
                            <label htmlFor="task-name">Название</label>
                            <input type="text" id="task-name" name="task-name" required />
                        </div>

                        <div className="modal-row">
                            <label htmlFor="task-description">Описание</label>
                            <input type="text" id="task-description" name="task-description" />
                        </div>

                        <div className="modal-row">
                            <label htmlFor="task-tags">Теги (через пробел)</label>
                            <input type="text" id="task-tags" name="task-tags" />
                        </div>

                        {/* Секция чеклистов */}
                        <div className="modal-row">
                            <label>Чеклисты</label>

                            {/* Отображение добавленных чеклистов */}
                            {modalChecklists.map((checklist, idx) => (
                                <div key={idx} className="checklist-modal-item">
                                    <div className="checklist-item-header">
                                        <strong>{checklist.title}</strong>
                                        <button
                                            type="button"
                                            className="checklist-item-remove"
                                            onClick={() => setModalChecklists(prev => prev.filter((_, i) => i !== idx))}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <ul className="checklist-items-list">
                                        {checklist.items.map((item, itemIdx) => (
                                            <li key={itemIdx}>{item.title}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}

                            {/* Форма для текущего чеклиста */}
                            <div className="checklist-form">
                                <input
                                    type="text"
                                    className="checklist-title-input"
                                    placeholder="Название чеклиста"
                                    value={currentChecklistTitle}
                                    onChange={(e) => setCurrentChecklistTitle(e.target.value)}
                                />

                                {/* Список пунктов текущего чеклиста */}
                                {currentChecklistItems.length > 0 && (
                                    <div className="checklist-current-items">
                                        {currentChecklistItems.map((item, idx) => (
                                            <div key={idx} className="checklist-current-item">
                                                <span>{item.title}</span>
                                                <button
                                                    type="button"
                                                    className="checklist-item-remove"
                                                    onClick={() => setCurrentChecklistItems(prev => prev.filter((_, i) => i !== idx))}
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Добавление нового пункта */}
                                <div className="checklist-add-item">
                                    <input
                                        type="text"
                                        className="checklist-item-input"
                                        placeholder="Новый пункт"
                                        value={newItemTitle}
                                        onChange={(e) => setNewItemTitle(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                if (newItemTitle.trim()) {
                                                    setCurrentChecklistItems(prev => [...prev, {
                                                        title: newItemTitle.trim(),
                                                        completed: false
                                                    }]);
                                                    setNewItemTitle('');
                                                }
                                            }
                                        }}
                                    />
                                    <button
                                        type="button"
                                        className="checklist-add-item-btn"
                                        onClick={() => {
                                            if (newItemTitle.trim()) {
                                                setCurrentChecklistItems(prev => [...prev, {
                                                    title: newItemTitle.trim(),
                                                    completed: false
                                                }]);
                                                setNewItemTitle('');
                                            }
                                        }}
                                    >
                                        + Пункт
                                    </button>
                                </div>

                                {/* Сохранить чеклист */}
                                <button
                                    type="button"
                                    className="checklist-save-btn"
                                    onClick={() => {
                                        if (currentChecklistTitle.trim() && currentChecklistItems.length > 0) {
                                            setModalChecklists(prev => [...prev, {
                                                title: currentChecklistTitle.trim(),
                                                items: currentChecklistItems
                                            }]);
                                            setCurrentChecklistTitle('');
                                            setCurrentChecklistItems([]);
                                        }
                                    }}
                                    disabled={!currentChecklistTitle.trim() || currentChecklistItems.length === 0}
                                >
                                    Добавить чеклист
                                </button>
                            </div>
                        </div>

                        <div className="modal-button-field">
                            <button className="modal-button">Создать задачу</button>
                        </div>
                    </form>
                </Modal>
            }

            {/* ===== COLUMN MODAL ===== */}

            {isColumnModalOpen &&
                <Modal isOpen={isColumnModalOpen} onClose={onCloseColumnModal} title="Создать колонку" iconPath={columnIcon}>
                    <form
                        className="modal-form"
                        onSubmit={onSubmitColumn}
                    >
                        <div className="modal-row">
                            <label htmlFor="column-name">Название колонки</label>
                            <input type="text" id="column-name" name="column-name" required />
                        </div>
                        <div className="modal-button-field">
                            <button className="modal-button">
                                Создать
                            </button>
                        </div>
                    </form>
                </Modal>
            }

            {/* ===== USER MODAL ===== */}

            {userModalOpen &&
                <Modal isOpen={userModalOpen} onClose={onCloseUserModal} title="Информация о пользователе" iconPath={humanIcon}>
                    <div className="modal-form">
                        <div>
                            андрюха
                        </div>
                        <div className="modal-button-field">
                            <button className="modal-button">
                                Изменить
                            </button>
                            <button className="modal-button" style={{ backgroundColor: "red" }}>
                                Выйти
                            </button>
                        </div>
                    </div>
                </Modal>
            }

        </>
    )
}