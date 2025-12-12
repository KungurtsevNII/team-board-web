// BoardRow.tsx
import type { Board } from "../../types/types";
import "./BoardRow.css";
import arrowIcon from "/src/assets/arrow.png";
import deleteIcon from "/src/assets/delete.svg";

interface BoardRowProps {
    board: Board;
    isActive: boolean;
    onDelete: (boardId: string) => void;
    onSelect?: (boardId: string) => void;
}

export const BoardRow = ({ board, isActive, onSelect, onDelete }: BoardRowProps) => {
    const handleClick = () => {
        console.log('BoardRow clicked:', board.id, 'isActive:', isActive);
        onSelect?.(board.id);
    };

    const handleDelete = () => {
        onDelete(board.id);
    };

    return (
        <div
            className={`board-row-container ${isActive ? 'board-row-container--active' : ''}`}
            onClick={handleClick}
        >
            {/* Синяя полоска слева */}
            <div className="board-row-rect" />

            <div
                className="board-row__title"
                data-tooltip={board.name}
            >
                <p className="board-row__title-text"
                >
                    {board.name}
                </p>
            </div>

            <img
                src={deleteIcon}
                alt="delete"
                className="board-row-delete-icon"
                onClick={handleDelete}
            />
            <img
                src={arrowIcon}
                alt="arrow"
                className="board-row-arrow-icon"
            />
        </div>
    );
};
