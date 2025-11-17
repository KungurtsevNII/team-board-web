import type { Board } from "../../types/board";
import "./BoardRow.css"
import arrowIcon from "/src/assets/arrow.png"

interface BoardRowProps{
    board: Board;
    isActive: boolean;
    onSelect?: (boardId: string) => void;
}

export const BoardRow = ({board, isActive, onSelect}: BoardRowProps) => {
    const handleClick = () => onSelect?.(board.id);
    return(
        <>
            <div className="board-row-container" 
                key={board.id} 
                onClick={handleClick}>

                <div className={isActive ? "board-row-rect--active" : "board-row-rect"}></div>
                <div className={isActive ? "board-row__title--active" : "board-row__title"}>
                   <p className="board-row__title-text">{board.name}</p>
                </div>
                {!isActive && <img src={arrowIcon} alt="show" className="board-row-arrow-icon"/>}

            </div>
        </>
    )
}