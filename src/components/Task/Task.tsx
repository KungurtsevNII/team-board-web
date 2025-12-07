import "./Task.css"
import arrow from "/src/assets/arrow.png"
import dots from "/src/assets/dots.png"
import type {
    Task as TaskType
} from "../../types/types"
import { useCallback } from "react";
import { useTaskContext } from "../../utils/TaskProvider";
import { useBoardContext } from "../../utils/BoardProvider";

interface TaskProps {
    task: TaskType;
    onTagClick: (tag: string) => void;
    onSettingsClick: () => void;
}

export const Task = ({ task, onTagClick, onSettingsClick }: TaskProps) => {
    const taskCtx = useTaskContext();
    const boardCtx = useBoardContext();
    const isExpanded = taskCtx.expandedTaskId === task.id;

    const handleToggle = useCallback(async () => {
        if (isExpanded) {
            taskCtx.setExpandedTaskId(null);
        } else {
            taskCtx.setExpandedTaskId(task.id);
            await taskCtx.fetchTaskDetails(task.id);
        }
    }, [isExpanded, taskCtx, task.id]);

    const handleChecklistChange = useCallback(async (
        checklistIdx: number,
        itemIdx: number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!task.checklists) return;

        const updatedChecklists = task.checklists.map((checklist, idx) => {
            if (idx !== checklistIdx) return checklist;
            return {
                ...checklist,
                items: checklist.items.map((item, iIdx) => {
                    if (iIdx !== itemIdx) return item;
                    return { ...item, completed: e.target.checked };
                })
            };
        });

        const updatedTask = { ...task, checklists: updatedChecklists };
        await taskCtx.updateTask(updatedTask);
    }, [task, taskCtx]);

    return (
        <div className="task-container">
            <div className="task__header">
                <span className="task__header-text">{boardCtx.board?.shortName} #{task.number} </span>
            </div>
            <div className="task__title">
                <h3>{task.title}</h3>
            </div>

            <img
                className={`arrow-icon ${isExpanded ? 'arrow-icon--active' : ''}`}
                src={arrow}
                alt="Toggle task details"
                onClick={handleToggle}
            />

            <img
                className="dots-icon"
                src={dots}
                alt="Toggle task details"
                onClick={onSettingsClick}
            />

            <div className={`task__details ${isExpanded ? 'task__details--expanded' : ''}`}>
                <div className="task__details-content">
                    <div className="task__content">
                        <div className="task__description">
                            <p>{task.description}</p>
                        </div>
                        <div className="task__tags">
                            {task.tags?.map((tag, index) => (
                                tag !== "" &&
                                <span key={index} className="tag" onClick={() => onTagClick(tag)}>#{tag} </span>
                            ))}
                        </div>
                    </div>

                    <div className="task__checklists">
                        {task.checklists?.map((checklist, idx) => (
                            <div key={idx} className="checklist">
                                <h4>{checklist.title}</h4>
                                {checklist.items.map((item, itemIdx) => (
                                    <div key={itemIdx} className="checklist-item">
                                        <input
                                            type="checkbox"
                                            checked={item.completed}
                                            onChange={(e) => handleChecklistChange(idx, itemIdx, e)}
                                        />
                                        <span>{item.title}</span>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
