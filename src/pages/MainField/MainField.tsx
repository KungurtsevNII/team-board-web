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


import type { Board, BoardRequest } from "../../types/board"
import type { Column, ColumnRequest } from "../../types/column"
import type { Task, TaskRequest } from "../../types/task"
import { dataService } from "../../services/dataService"
import { Loading } from "../../components/Loading/Loading"
import type { Checklist, ChecklistItem } from "../../types/checklist"

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
    const [userModalOpen, setUserModalOpen] = useState(false);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeBoardId, setActiveBoardId] = useState<string>("");

    const [loadingColumns, setLoadingColumns] = useState(true);
    const [loadingBoards, setLoadingBoards] = useState(true);

    const [board, setBoard] = useState<Board | null>(null);
    const [boards, setBoards] = useState<Board[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [taskDetails, setTaskDetails] = useState<Task | null>(null);
    const [addColumnReq, setAddColumnReq] = useState<ColumnRequest | null>(null);
    const [addTaskReq, setAddTaskReq] = useState<TaskRequest | null>(null);
    const [addBoardReq, setAddBoardReq] = useState<BoardRequest | null>(null);
    const [taskColumn, setTaskColumn] = useState<Column | null>(null);

    const isMobile = useIsMobile();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState("")
    const [isSearchOpen, setIsSearchOpen] = useState(false)

    useEffect(() => {
        // при переходе на десктоп всегда открыта
        if (!isMobile) {
            setIsSidebarOpen(true);
        } else {
            setIsSidebarOpen(false);
        }
    }, [isMobile]);

    const toggleSidebar = () => {
        if (isMobile) {
            setIsSidebarOpen(prev => !prev);
        }
    };

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

        setIsSidebarOpen(false);

        const load = async () => {
            try {
                setLoadingColumns(true);
                const [b] = await Promise.all([
                    dataService.getBoard(activeBoardId),
                ]);
                if (cancelled) return;
                setBoard(b);
                if (b.columns) {
                    setColumns(b.columns);
                }
                if (b.tasks) {
                    setTasks(b.tasks);
                }
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

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                if (taskDetails) {
                    const tsk = await dataService.getTask(taskDetails.id);
                    if (cancelled) return;
                    setTasks(prev =>
                        prev.map(t =>
                            t.id === tsk.id ? t = tsk : t
                        )
                    )
                }
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? "Unknown error");
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, [taskDetails]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                if (addColumnReq != null) {

                    const col = await dataService.createColumn(activeBoardId, addColumnReq);
                    if (cancelled) return;
                    setColumns(
                        prev => [...prev, col]
                    )
                }
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
    }, [addColumnReq]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                if (addTaskReq == null || !activeBoardId) return;

                const newTask = await dataService.createTask(addTaskReq);
                if (cancelled) return;

                setTasks(prev => [...prev, newTask]);
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? 'Unknown error');
            } finally {
                if (!cancelled) {
                    // если есть отдельный лоадер для тасок — тут его выключить
                }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [addTaskReq, activeBoardId]);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                if (addBoardReq == null) return;

                const newBoard = await dataService.createBoard(addBoardReq);
                if (cancelled) return;

                setBoards(prev => [...prev, newBoard]);
            } catch (e: any) {
                if (cancelled) return;
                setError(e?.message ?? 'Unknown error');
            } finally {
                if (!cancelled) {
                    // если есть отдельный лоадер для тасок — тут его выключить
                }
            }
        };

        load();
        return () => { cancelled = true; };
    }, [addBoardReq]);


    const openAddBoardModal = () => setIsBoardModalOpen(true);
    const closeAddBoardModal = () => setIsBoardModalOpen(false);

    const openAddTaskModal = () => setIsTaskModalOpen(true);
    const closeAddTaskModal = () => setIsTaskModalOpen(false);

    const openAddColumnModal = () => setIsColumnModalOpen(true);
    const closeAddColumnModal = () => setIsColumnModalOpen(false);

    const openUserModal = () => setUserModalOpen(true);
    const closeUserModal = () => setUserModalOpen(false);

    const onTaskColumn = (column: Column) => {
        setTaskColumn(column);
        openAddTaskModal(); // setIsTaskModalOpen(true)
    };


    // перемещение задачи внутри фронта
    const moveTaskToColumn = (taskId: string, targetColumnId: string) => {
        setTasks(prev =>
            prev.map(t =>
                t.id === taskId ? { ...t, columnID: targetColumnId } : t
            )
        )
    }

    // обработчик drop из колонки
    const handleTaskDrop = async (taskId: string, targetColumnId: string) => {
        moveTaskToColumn(taskId, targetColumnId);

        try {
            const updated = await dataService.moveTask(taskId, targetColumnId);
            if (updated) {
                setTasks(prev =>
                    prev.map(t => (t.id === updated.id ? updated : t)),
                );
            }
        } catch (e) {
            setTasks(prev =>
                prev.map(t =>
                    t.id === taskId ? { ...t, columnID: /* старый columnID */ t.columnID } : t,
                ),
            );
        }
    };


    const handleTaskDetails = (task: Task) => {
        setTaskDetails(task)
    }

    const handleChangeChecklist = (task: Task) => {
        console.log(task)
        dataService.updateTask(task)
    }
    //Params : react on submit value
    const handleAddColumn = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const columnName = form.elements.namedItem('column-name') as HTMLInputElement;
        var col: ColumnRequest = { name: columnName.value }
        setAddColumnReq(col)
        closeAddColumnModal()
    }

    const handleAddBoard = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const form = e.target as HTMLFormElement;
        const name = form.elements.namedItem('board-name') as HTMLInputElement;
        const shortName = form.elements.namedItem('board-short-name') as HTMLInputElement;

        var brd: BoardRequest = { name: name.value, shortName: shortName.value }

        setAddBoardReq(brd)
        closeAddBoardModal()
    }

    // const onAddTask = (e: React.FormEvent<HTMLFormElement>) => {
    //     e.preventDefault();

    //     if (!taskColumn) return;
    //     const form = e.target as HTMLFormElement;
    //     const taskName = form.elements.namedItem('task-name') as HTMLInputElement;
    //     const taskDesc = form.elements.namedItem('task-description') as HTMLInputElement;
    //     const taskTags = form.elements.namedItem('task-tags') as HTMLInputElement;

    //     const splitedTags = taskTags.value.split(' ').map(t => t.trim());
    //     console.log(splitedTags)
    //     const tsk: TaskRequest = {
    //         title: taskName.value,
    //         description: taskDesc.value,
    //         boardID: activeBoardId,
    //         tags: splitedTags,
    //         columnID: taskColumn.id,        // вот тут привязываем к колонке
    //     };

    //     setAddTaskReq(tsk);
    //     closeAddTaskModal();
    // };

    // Для модалки создания таски - чеклисты
const [modalChecklists, setModalChecklists] = useState<Checklist[]>([]);
const [currentChecklistTitle, setCurrentChecklistTitle] = useState<string>('');
const [currentChecklistItems, setCurrentChecklistItems] = useState<ChecklistItem[]>([]);
const [newItemTitle, setNewItemTitle] = useState<string>('');


    const onAddTask = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  if (!taskColumn) return;

  const form = e.target as HTMLFormElement;
  const taskName = form.elements.namedItem('task-name') as HTMLInputElement;
  const taskDesc = form.elements.namedItem('task-description') as HTMLInputElement;
  const taskTags = form.elements.namedItem('task-tags') as HTMLInputElement;

  const splitedTags = taskTags.value.split(' ').map((t) => t.trim());

  const tsk: TaskRequest = {
    title: taskName.value,
    description: taskDesc.value,
    boardID: activeBoardId!,
    tags: splitedTags,
    columnID: taskColumn.id,
    checklists: modalChecklists, // Добавляем чеклисты
  };

  setAddTaskReq(tsk);
  
  // Сброс стейтов чеклистов
  setModalChecklists([]);
  setCurrentChecklistTitle('');
  setCurrentChecklistItems([]);
  setNewItemTitle('');
  
  closeAddTaskModal();
};


    const handleDeleteColumn = (column: Column) => {
        // setDeleteColumnReq(column)
        setColumns(prev => prev.filter(c => c.id !== column.id))
    }

    const filteredTasks = tasks.filter(t => {
        const sq = searchQuery.toLowerCase().trim();

        if (!sq) {
            return true;
        }

        // поиск по тегу: "#bug" → ищем "bug" в массиве tags
        if (sq[0] === "#") {
            const tagQuery = sq.slice(1); // выкинули "#"

            if (!tagQuery) {
                return false;
            }

            return t.tags?.some(tag =>
                tag.toLowerCase() === tagQuery ||          // строгое совпадение
                tag.toLowerCase().includes(tagQuery)       // или по вхождению
            );
        }
        // обычный поиск по названию таски
        return t.title.toLowerCase().includes(sq);
    });

    const handleEditTask = (taskId: string) => {
        alert(`edit_task: ${taskId}`)
    }

    const handleDeleteTask = (taskId: string) => {
        setTasks(prev => prev.filter(t => t.id !== taskId))
    }

    return (
        <>
            <div className="main-field">
                <div className={`choose-field ${isMobile ? "choose-field--mobile" : ""} ${isSidebarOpen ? "choose-field--open" : ""}`}>
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
                                    <button onClick={openAddBoardModal} >Создать доску</button>
                                </div>
                                : boards.map(v =>
                                    <BoardRow
                                        key={v.id}
                                        isActive={activeBoardId === v.id}
                                        board={v}
                                        onSelect={(v) => setActiveBoardId(v)}
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
                            {/* <img
                                className="search-icon"
                                src={searchIcon}
                                alt="search"
                            /> */}
                            {/* <input
                                className="search-input"
                                type="text"
                                placeholder="Поиск"
                            /> */}
                            <div className="search-wrapper">
                                <input
                                    className="search-input"
                                    type="text"
                                    placeholder="Поиск задач"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        setSearchQuery(value);
                                        setIsSearchOpen(value.length > 0);
                                    }}
                                    onBlur={() => setTimeout(() => setIsSearchOpen(false), 150)}
                                    onFocus={() => searchQuery && setIsSearchOpen(true)}
                                />
                                {isSearchOpen && filteredTasks.length > 0 && (
                                    <div className="search-dropdown">
                                        {filteredTasks.slice(0, 10).map((task) => (
                                            <div
                                                key={task.id}
                                                className="search-item"
                                                onMouseDown={() => {
                                                    handleTaskDetails(task);
                                                    setIsSearchOpen(false);
                                                }}
                                            >
                                                <div className="search-item-title">{task.title}</div>
                                                <div className="search-item-meta">
                                                    {board?.shortName == null ?  board?.shortName : board?.name} #{tasks.find(t => t.id === task.id)?.number} · {columns.find(c => c.id === task.columnID)?.name}
                                                </div>
                                            </div>
                                        ))}
                                        {filteredTasks.length > 10 && (
                                            <div className="search-more">Show all ({filteredTasks.length})</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="user-data" onClick={openUserModal}>
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
                                        : columns?.map(v =>
                                            <TasksColumn
                                                key={v.id}
                                                column={v}
                                                tasks={tasks.filter(t => t.columnID === v.id)}
                                                boardShortName={board?.shortName}
                                                onTaskColumn={onTaskColumn}
                                                onAddColumn={openAddColumnModal}
                                                onTaskDrop={handleTaskDrop}         // колонка сообщает, что в неё уронили таску
                                                OnTaskDetails={handleTaskDetails}
                                                onChecklistChange={handleChangeChecklist}
                                                onDeleteColumn={handleDeleteColumn}
                                                onTagClick={(tag) => {setSearchQuery(`#${tag}`); setIsSearchOpen(true)}}
                                                onTaskDelete={handleDeleteTask}
                                                onTaskEdit={handleEditTask}
                                            />
                                        )
                        }
                    </div>

                </div>

                <Modal isOpen={isBoardModalOpen} onClose={closeAddBoardModal} title="Создать доску" iconPath={boardIcon}>
                    <form
                        className="modal-form"
                        onSubmit={handleAddBoard}
                    >
                        <div className="modal-row">
                            <label htmlFor="board-name">Название доски</label>
                            <input type="text" id="board-name" name="board-name" required/>
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

                {/* <Modal isOpen={isTaskModalOpen} onClose={closeAddTaskModal} title="Создать задачу" iconPath={taskIcon}>
                    <form
                        className="modal-form"
                        onSubmit={onAddTask}
                    >
                        <div className="modal-row">
                            <label htmlFor="task-name">Название</label>
                            <input type="text" id="task-name" name="task-name" required/>
                        </div>
                        <div className="modal-row">
                            <label htmlFor="task-description">Описание</label>
                            <input type="text" id="task-description" name="task-description" />
                        </div>
                        <div className="modal-row">
                            <label htmlFor="task-tags">Теги (через пробел)</label>
                            <input type="text" id="task-tags" name="task-tags" />
                        </div>
                        <div className="modal-button-field">
                            <button className="modal-button">
                                Создать
                            </button>
                        </div>
                    </form>
                </Modal> */}

                <Modal 
  isOpen={isTaskModalOpen} 
  onClose={() => {
    closeAddTaskModal();
    setModalChecklists([]);
    setCurrentChecklistTitle('');
    setCurrentChecklistItems([]);
    setNewItemTitle('');
  }} 
  title="Новая задача" 
  iconPath={taskIcon}
>
  <form className="modal-form" onSubmit={onAddTask}>
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


                <Modal isOpen={isColumnModalOpen} onClose={closeAddColumnModal} title="Создать колонку" iconPath={columnIcon}>
                    <form
                        className="modal-form"
                        onSubmit={handleAddColumn}
                    >
                        <div className="modal-row">
                            <label htmlFor="column-name">Название колонки</label>
                            <input type="text" id="column-name" name="column-name" required/>
                        </div>
                        <div className="modal-button-field">
                            <button className="modal-button">
                                Создать
                            </button>
                        </div>
                    </form>
                </Modal>

                <Modal isOpen={userModalOpen} onClose={closeUserModal} title="Информация о пользователе" iconPath={humanIcon}>
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

            </div>
        </>
    )
}