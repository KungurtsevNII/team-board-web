import "./Task.css"
// import plus from "/src/assets/plus.png"
import arrow from "/src/assets/arrow.png"
import dots from "/src/assets/dots.png"
import type { Task as TaskType } from "../../types/task";
import type { Checklist } from "../../types/checklist";
import { useEffect, useState } from "react";
interface TaskProps{
    task: TaskType;
    boardShortName? : string;
    OnTaskDetails : (task: TaskType) => void;
    OnChecklistChange : (task: TaskType) => void;
    onTagClick: (tag: string) => void;
    onSettingsClick: () => void;
}

export const Task = ({task, boardShortName, OnTaskDetails, OnChecklistChange, onTagClick, onSettingsClick} : TaskProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [checklistsValues, onChangeChecklistsValues] = useState<Checklist[] | undefined>(task.checklists);

    useEffect(() => {
        onChangeChecklistsValues(task.checklists)
    },[task])

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
        OnTaskDetails(task);
    };

    const handleChecklistChange = (
        checklistIdx : number,
        itemIdx : number,
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        if (!checklistsValues) return;
            
        const updatedChecklists = checklistsValues.map((checklist, idx) => {
            if (idx !== checklistIdx) return checklist;
            
            return {
                ...checklist,
                items: checklist.items.map((item, iIdx) => {
                    if (iIdx !== itemIdx) return item;
                    return { ...item, completed: e.target.checked };
                })
            };
        });
        
        onChangeChecklistsValues(updatedChecklists);
        task.checklists = updatedChecklists 
        OnChecklistChange(task);
    }

    return(
        <div className="task-container">
            <div className="task__header">
                <span className="task__header-text">{boardShortName} #{task.number} </span>
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
                                <span key={index} className="tag" onClick={() => onTagClick(tag)}>#{tag} </span>
                            ))}
                        </div>
                    </div>

                    <div className="task__checklists">
                        {checklistsValues?.map((checklist, idx) => (
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
