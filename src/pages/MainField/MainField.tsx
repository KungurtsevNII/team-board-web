import "./MainField.css"
import { TasksColumn } from "../../components/TasksColumn/TasksColumn"
import { BoardRow } from "../../components/BoardRow/BoardRow"
import { useCallback, useEffect, useState } from "react"

import humanIcon from "/src/assets/human.png"

import type {
    BoardRequest, Column, ColumnRequest, Task, TaskRequest, SearchTasksRequest
} from "../../types/types"
import { Loading } from "../../components/Loading/Loading"
import { useTaskContext } from "../../utils/TaskProvider"
import { useBoardContext } from "../../utils/BoardProvider"
import { ErrorModal } from "../../components/ErrorModal/ErrorModal"
import { ExternalForms } from "../../components/ExternalForms/ExternalForms"

const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState(
        window.matchMedia("(max-width: 768px)").matches
    );

    useEffect(() => {
        const mql = window.matchMedia("(max-width: 768px)");
        const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);

        mql.addEventListener("change", handler);
        return () => mql.removeEventListener("change", handler);
    }, []);

    return isMobile;
};

export const MainField = () => {
    const [isBoardModalOpen, setIsBoardModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isColumnModalOpen, setIsColumnModalOpen] = useState(false);
    const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
    const [userModalOpen, setUserModalOpen] = useState(false);

    const [loadingColumns, setLoadingColumns] = useState(true);
    const [loadingBoards, setLoadingBoards] = useState(true);

    const [taskColumn, setTaskColumn] = useState<Column | null>(null);

    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    const [pendingTaskId, setPendingTaskId] = useState<string | null>(null);

    const taskCtx = useTaskContext()
    const boardCtx = useBoardContext()

    useEffect(() => {
        // при переходе на десктоп всегда открыта
        if (!isMobile) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [isMobile]);

    const toggleSidebar = useCallback(() => {
        if (isMobile) {
            setIsSidebarOpen(prev => !prev);
        }
    }, [isMobile]);


    useEffect(() => {
        setLoadingBoards(true);
        const load = async () => {
            await boardCtx.fetchBoards()
            setLoadingBoards(false)
        }
        load()
    }, []);

// MainField.tsx

useEffect(() => {
    setIsSidebarOpen(false);
    setLoadingColumns(true);
    const load = async () => {
        if (!pendingTaskId) {
            taskCtx.setExpandedTaskId(null);
        }

        const board = await boardCtx.fetchBoard();
        if (board?.tasks) {
            taskCtx.setTasks(board.tasks);
        } else {
            taskCtx.setTasks([]);
        }
        setLoadingColumns(false);
    };
    load();
}, [boardCtx.activeBoardId]); 


    useEffect(() => {
        if (boardCtx.error !== null || taskCtx.error !== null) {
            setIsErrorModalOpen(true);
        }
    }, [boardCtx.error, taskCtx.error]);

    const handleBoardSelect = useCallback((boardId: string) => {
        boardCtx.setActiveBoardId(boardId);
    }, []);

    const handleOnTaskColumn = useCallback((column: Column) => {
        setTaskColumn(column);
        setIsTaskModalOpen(true)
    }, [])

    //FIXME на телефоне таски не муваются
    // обработчик drop из колонки
    const handleTaskDrop = useCallback(async (taskId: string, targetColumnId: string) => {
        taskCtx.moveTask(taskId, targetColumnId);
    }, []);

const handleTaskDetails = useCallback((task: Task) => {
    if (boardCtx.activeBoardId !== task.boardID) {
        setLoadingColumns(true);
        boardCtx.setActiveBoardId(task.boardID);
        setPendingTaskId(task.id); 
    } else {
        taskCtx.setExpandedTaskId(task.id);
        taskCtx.fetchTaskDetails(task.id);
    }
}, [boardCtx, taskCtx]);


    // Отслеживаем завершение загрузки
    useEffect(() => {
        if (!loadingColumns && pendingTaskId) {
            // Доска загрузилась - открываем таску
            taskCtx.setExpandedTaskId(pendingTaskId);
            taskCtx.fetchTaskDetails(pendingTaskId);
            setPendingTaskId(null);
        }
    }, [loadingColumns, pendingTaskId, taskCtx]);


    const handleDeleteBoard = (boardId: string) => {
        boardCtx.deleteBoard(boardId)
    }

    const handleAddColumn = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const columnName = form.elements.namedItem('column-name') as HTMLInputElement;
        const col: ColumnRequest = { name: columnName.value }
        boardCtx.addColumn(col)
        setIsColumnModalOpen(false)
    }, [boardCtx])

    const handleAddBoard = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const name = form.elements.namedItem('board-name') as HTMLInputElement;
        const shortName = form.elements.namedItem('board-short-name') as HTMLInputElement;

        let brd: BoardRequest = { name: name.value, shortName: shortName.value }

        boardCtx.addBoard(brd)
        setIsBoardModalOpen(false);
    }, [])

    const handleAddTask = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        //Получаем данные из ExternalForms через customEvent
        const taskData = (e.target as any).taskData as TaskRequest;

        if (!taskData) {
            console.error('Task data not found');
            return;
        }

        console.log('Creating task:', taskData);
        taskCtx.addTask(taskData);
        setIsTaskModalOpen(false);
        setTaskColumn(null); // ✅ Очищаем после создания
    }, [taskCtx]);

    // const filteredTasks = useMemo(() => {
    //     return taskCtx.tasks.filter(t => {
    //         const sq = searchQuery.toLowerCase().trim();
    //         if (!sq) return true;

    //         if (sq[0] === "#") {
    //             const tagQuery = sq.slice(1);
    //             if (!tagQuery) return false;
    //             return t.tags?.some(tag =>
    //                 tag.toLowerCase() === tagQuery ||
    //                 tag.toLowerCase().includes(tagQuery)
    //             );
    //         }

    //         return t.title.toLowerCase().includes(sq);
    //     });
    // }, [taskCtx.tasks, searchQuery]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toLowerCase().split(' ');
        const tags = value.filter(v => v[0] === "#");
        const query = value.filter(v => v[0] !== "#").join(" ");
        setSearchQuery(e.target.value);
        const req: SearchTasksRequest = {
            query: query,
            filters: { tags: tags.map(v => v.slice(1)) }
        }
        console.log(req.query, req.filters?.tags);
        taskCtx.searchTasks(req)
        setIsSearchOpen(value.length > 0);
    }, []);

    const handleOnCloseErrorModal = useCallback(() => {
        setIsErrorModalOpen(false);
        taskCtx.setError(null)
        boardCtx.setError(null)
    }, [])

    return (
        <>
            <div className="main-field">
                <div className={`choose-field ${isMobile ? "choose-field--mobile" : ""} ${isSidebarOpen ? "choose-field--open" : ""}`}>
                    <div className="choose-field__title">
                        <h3>Мои доски</h3>
                        <button className="choose-field__add" onClick={() => setIsBoardModalOpen(true)}>+</button>
                    </div>
                    <div className="choose-field__list">
                        {loadingBoards
                            ? <div className="choose-field__empty">
                                <Loading
                                    size={100}
                                />
                            </div>
                            : boardCtx.boards?.length === 0
                                ? <div className="choose-field__empty">
                                    <p>Список досок пуст</p>
                                    <button onClick={() => setIsBoardModalOpen(true)} >Создать доску</button>
                                </div>
                                : boardCtx.boards?.map(v =>
                                    <BoardRow
                                        key={v.id}
                                        isActive={boardCtx.activeBoardId === v.id}
                                        board={v}
                                        onSelect={handleBoardSelect}
                                        onDelete={handleDeleteBoard}
                                    />
                                )}
                    </div>
                </div>
                {isMobile && isSidebarOpen && (
                    <div
                        className="sidebar-backdrop"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}
                <div className="main-field__right">
                    <div className="main-field__header">
                        <div className="main-field__header-right">
                            {isMobile && (
                                <button
                                    className="choose-field__toggle"
                                    onClick={toggleSidebar}
                                >
                                    ☰
                                </button>
                            )}
                            <div className="search-wrapper">
                                <input //FIXME на телефоне на имя заезжает
                                    className="search-input"
                                    type="text"
                                    placeholder="Поиск задач"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
                                    onFocus={() => searchQuery && setIsSearchOpen(true)}
                                />
                                {isSearchOpen && taskCtx.searchedTasks.length > 0 && (
                                    <div className="search-dropdown">
                                        {taskCtx.searchedTasks.slice(0, 10).map((task) => (
                                            <div
                                                key={task.id}
                                                className="search-item"
                                                onMouseDown={() => {
                                                    handleTaskDetails(task);
                                                    setIsSearchOpen(false);
                                                }}
                                            >
                                                <div className="search-item-title">{task.title}</div>
                                                {/* TODO заполнить данные как-то, просто с бека мало приходит */}
                                                {/* <div className="search-item-meta">
                                                    {boardCtx.board?.shortName == null
                                                        ? boardCtx.board?.shortName
                                                        : boardCtx.board?.name} #{
                                                        taskCtx.tasks.find(t => t.id === task.id)?.number
                                                    } · {
                                                        boardCtx.columns.find(c => c.id === task.columnID)?.name}
                                                </div> */}
                                                <div className="search-item-meta">
                                                    №{task.number}
                                                </div>
                                            </div>
                                        ))}
                                        {taskCtx.searchedTasks.length > 10 && (
                                            <div className="search-more">Show all ({taskCtx.searchedTasks.length})</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="user-data" onClick={() => setUserModalOpen(true)}>
                            <div className="user-data__name">Владимир</div>
                            <img className="user-data__icon" src={humanIcon} alt="" />
                        </div>
                    </div>

                    <div className="main-field__content">
                        {
                            boardCtx.activeBoardId === ""
                                ? <div className="main-field__empty">Выберите доску</div>
                                : loadingColumns
                                    ? <div className="main-field__empty">
                                        <Loading
                                            size={200}
                                        />
                                    </div>
                                    : boardCtx.columns.length == 0
                                        ? <div className="main-field__empty">
                                            <p>Тут пока пусто</p>
                                            <button style={{ backgroundColor: 'var(--color-main-blue)' }} onClick={() => setIsColumnModalOpen(true)}>Создать колонку</button>
                                        </div>
                                        : boardCtx.columns?.map(v =>
                                            <TasksColumn
                                                key={v.id}
                                                column={v}
                                                tasks={taskCtx.tasks.filter(t => t.columnID === v.id)}
                                                onAddColumn={() => setIsColumnModalOpen(true)}
                                                onAddTask={() => handleOnTaskColumn(v)}
                                                onTaskDrop={handleTaskDrop}
                                                onTagClick={(tag) => { setSearchQuery(`#${tag}`); setIsSearchOpen(true) }}
                                            />
                                        )
                        }
                    </div>

                </div>

                <ExternalForms
                    isBoardModalOpen={isBoardModalOpen}
                    onCloseBoardModal={() => setIsBoardModalOpen(false)}
                    onSubmitBoard={handleAddBoard}

                    isTaskModalOpen={isTaskModalOpen}
                    onCloseTaskModal={() => {
                        setIsTaskModalOpen(false);
                        setTaskColumn(null);
                    }}
                    onSubmitTask={handleAddTask}
                    taskColumn={taskColumn}
                    activeBoardId={boardCtx.activeBoardId}

                    isColumnModalOpen={isColumnModalOpen}
                    onCloseColumnModal={() => setIsColumnModalOpen(false)}
                    onSubmitColumn={handleAddColumn}

                    userModalOpen={userModalOpen}
                    onCloseUserModal={() => setUserModalOpen(false)}
                />

                {
                    (boardCtx.error || taskCtx.error) &&
                    <ErrorModal
                        text={taskCtx.error || boardCtx.error}
                        isOpen={isErrorModalOpen}
                        onClose={handleOnCloseErrorModal}
                    />
                }

            </div>
        </>
    )
}