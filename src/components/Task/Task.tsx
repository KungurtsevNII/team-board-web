import "./Task.css"
// import plus from "/src/assets/plus.png"
import arrow from "/src/assets/arrow.png"
import type { Task as TaskType } from "../../types/task";
import type { Checklist } from "../../types/checklist";
import { useState } from "react";

interface TaskProps{
    task: TaskType;
    boardShortName? : string;
}

export const Task = ({task, boardShortName} : TaskProps) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [checklistsValues, onChangeChecklistsValues] = useState<Checklist[] | undefined>(task.checklists);
    
    const name = "TBback"
    const num = 3
    const title = "Описать структуру бд"
    const description = "Сделать структуру бд для проекта"
    const tags = ["db", "structure"]
    const checklists : Checklist[] = [
        {
            title: "Сделать структуру бд",
            items: [
                {
                    title: "Описать user",
                    completed: false
                },
                {
                    title: "Описать product",
                    completed: true
                }
            ]
        },
        {
            title: "Сделать структуру бд",
            items: [
                {
                    title: "Сделать структуру бд",
                    completed: false
                }
            ]
        }
    ]

    const handleToggle = () => {
        setIsExpanded(!isExpanded);
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

            <div className={`task__details ${isExpanded ? 'task__details--expanded' : ''}`}>
                <div className="task__details-content">
                    <div className="task__content">
                        <div className="task__description">
                            <p>{task.description}</p>
                        </div>
                        
                        <div className="task__tags">
                            {task.tags?.map((tag, index) => (
                                <span key={index} className="tag">#{tag} </span>
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
