import "./MainField.css"
import { TasksColumn } from "../../components/TasksColumn/TasksColumn"
import { BoardRow } from "../../components/BoardRow/BoardRow"
import { Modal } from "../../components/Modal/Modal"
import { useEffect, useState } from "react"

import searchIcon from "/src/assets/search.png"
import humanIcon from "/src/assets/human.png"
import boardIcon from "/src/assets/board.png"
import taskIcon from "/src/assets/task.png"
import columnIcon from "/src/assets/column.png"


import type { Board } from "../../types/board"
import type { Column } from "../../types/column"
import type { Task } from "../../types/task"
import { dataService } from "../../services/dataService"
import { Loading } from "../../components/Loading/Loading"


export const MainField = () => {
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeBoardId, setActiveBoardId] = useState<string>("");

    const [loadingColumns, setLoadingColumns] = useState(true);
    const [loadingBoards, setLoadingBoards] = useState(true);


    const [board, setBoard] = useState<Board | null>(null);
    const [boards, setBoards] = useState<Board[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);


    const boardId = "board-1";

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                setLoadingBoards(true);
                const [b /*, cols, ts*/] = await Promise.all([
                    dataService.getBoards(),
                    // dataService.getColumns(boardId),
                    // dataService.getTasks(boardId),
                ]);
                if (cancelled) return;
                setBoards(b);
                // setColumns(cols);
                // setTasks(ts);
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "Unknown error");
            } finally {
                if (!cancelled) setLoadingBoards(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        let cancelled = false;


        const load = async () => {
            try {
                setLoadingColumns(true);
                console.log("activeBoardId", activeBoardId);
                const [b, cols, ts] = await Promise.all([
                    dataService.getBoard(activeBoardId),
                    dataService.getColumns(activeBoardId),
                    dataService.getTasks(activeBoardId),
                ]);
                if (cancelled) return;
                setBoard(b);
                setColumns(cols);
                setTasks(ts);
                console.log("board", b);
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "Unknown error");
            } finally {
                if (!cancelled) setLoadingColumns(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [activeBoardId]);

    const openAddBoardModal = () => setIsBoardModalOpen(true);
    const closeAddBoardModal = () => setIsBoardModalOpen(false);

    const openAddTaskModal = () => setIsTaskModalOpen(true);
    const closeAddTaskModal = () => setIsTaskModalOpen(false);

    const openAddColumnModal = () => setIsColumnModalOpen(true);
    const closeAddColumnModal = () => setIsColumnModalOpen(false);

    const onAddTask = (column: Column) => {
        console.log(column.name)
        openAddTaskModal()
    }

    // перемещение задачи внутри фронта
    const moveTaskToColumn = (taskId: string, targetColumnId: string) => {
        setTasks(prev =>
            prev.map(t =>
                t.id === taskId ? { ...t, column: { ...t.column, id: targetColumnId } } : t
            )
        )
    }

    // обработчик drop из колонки
    const handleTaskDrop = (taskId: string, targetColumnId: string) => {
        moveTaskToColumn(taskId, targetColumnId)
        // TODO: здесь можно вызвать dataService.updateTaskColumn(taskId, targetColumnId)
    }


    return (
        <>
            <div className="main-field">
                <div className="choose-field">
                    <div className="choose-field__title">
                        <h3>Мои доски</h3>
                        <button className="choose-field__add" onClick={openAddBoardModal}>+</button> {/* TODO: add modal */}
                    </div>
                    <div className="choose-field__list">
                        {loadingBoards
                            ? <div className="choose-field__empty">
                                <Loading
                                    size={100}
                                />
                            </div>
                            : boards.length === 0
                                ? <div className="choose-field__empty">
                                    <p>Список досок пуст</p>
                                    <button>Создать доску</button>
                                </div>
                                : boards.map(v =>
                                    <BoardRow
                                        key={v.id}
                                        isActive={activeBoardId === v.id}
                                        board={v}
                                        onSelect={(v) => { setActiveBoardId(v); console.log(v) }}
                                    />
                                )}
                    </div>
                </div>

                <div className="main-field__right">
                    <div className="main-field__header">
                        <img
                            className="search-icon"
                            src={searchIcon}
                            alt="search"
                        />
                        <div className="user-data">
                            <div className="user-data__name">Владимир</div>
                            <img className="user-data__icon" src={humanIcon} alt="" />
                        </div>
                    </div>

                    <div className="main-field__content">
                        {
                            activeBoardId === ""
                                ? <div className="main-field__empty">Выберите доску</div>
                                : loadingColumns
                                    ? <div className="main-field__empty">
                                        <Loading
                                            size={200}
                                        />
                                    </div>
                                    : columns.length == 0
                                        ? <div className="main-field__empty">
                                            <p>Тут пока пусто</p>
                                            <button style={{ backgroundColor: 'var(--color-main-blue)' }} onClick={openAddColumnModal}>Создать колонку</button>
                                        </div>
                                        : columns.map(v =>
                                            <TasksColumn
                                                key={v.id}
                                                column={v}
                                                tasks={tasks.filter(t => t.column.id === v.id)}
                                                boardShortName={board?.shortName}
                                                onTaskColumn={onAddTask}
                                                onAddColumn={openAddColumnModal}
                                                // dnd
                                                onTaskDrop={handleTaskDrop}         // колонка сообщает, что в неё уронили таску
                                            />
                                        )
                        }
                    </div>

                </div>

                <Modal isOpen={isBoardModalOpen} onClose={closeAddBoardModal} title="Создать доску" iconPath={boardIcon}>
                    <form
                        className="modal-form"
                        onSubmit={() => alert("submited")}
                    >
                        <div className="modal-row">
                            <label htmlFor="board-name">Название доски</label>
                            <input type="text" id="board-name" name="board-name" />
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

                <Modal isOpen={isTaskModalOpen} onClose={closeAddTaskModal} title="Создать задачу" iconPath={taskIcon}>
                    <form
                        className="modal-form"
                        onSubmit={() => alert("submited")}
                    >
                        <div className="modal-row">
                            <label htmlFor="task-name">Название</label>
                            <input type="text" id="task-name" name="task-name" />
                        </div>
                        <div className="modal-row">
                            <label htmlFor="task-description">Описание</label>
                            <input type="text" id="task-description" name="task-description" />
                        </div>
                        <div className="modal-row">
                            <label htmlFor="task-tags">Теги</label>
                            <input type="text" id="task-tags" name="task-tags" />
                        </div>
                        <div className="modal-button-field">
                            <button className="modal-button">
                                Создать
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal isOpen={isColumnModalOpen} onClose={closeAddColumnModal} title="Создать колонку" iconPath={columnIcon}>
                    <form
                        className="modal-form"
                        onSubmit={() => alert("submited")}
                    >
                        <div className="modal-row">
                            <label htmlFor="column-name">Название колонки</label>
                            <input type="text" id="column-name" name="column-name" />
                        </div>
                        <div className="modal-button-field">
                            <button className="modal-button">
                                Создать
                            </button>
                        </div>
                    </form>
                </Modal>

            </div>
        </>
    )
}