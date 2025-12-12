// contexts/BoardContext.tsx
import { createContext, useContext, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { Board, BoardRequest, Column, ColumnRequest } from '../types/types';
import { dataService } from '../services/dataService';

interface BoardContextType {

    board: Board | null;
    boards: Board[] | null
    //   boards: Board[];
    columns: Column[];
    loading: boolean;
    error: string | null;
    activeBoardId: string;
    addColumnProcess: boolean;
    setError: (error: string | null) => void;
    setIsAddColumnProcess: (isAddColumnProcess: boolean) => void;
    //   setBoards: (boards: Board[]) => void;
    setBoard: (board: Board | null) => void;
    setColumns: (columns: Column[]) => void;
    setActiveBoardId: (id: string) => void;
    addColumn: (column: ColumnRequest) => void;
    addBoard: (board: BoardRequest) => void;
    deleteColumn: (columnId: string) => void;
    deleteBoard: (boardId: string) => void;
    fetchBoards: () => void;
    fetchBoard: () => Promise<Board | null>;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
    const [board, setBoard] = useState<Board | null>(null);
    const [boards, setBoards] = useState<Board[]>([]);
    const [columns, setColumns] = useState<Column[]>([]);
    const [activeBoardId, setActiveBoardId] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [addColumnProcess, setIsAddColumnProcess] = useState(false);

    const addColumn = useCallback(async (column: ColumnRequest) => {
        setLoading(true);
        console.log(activeBoardId)
        try {
            const resp = await dataService.createColumn(activeBoardId, column);
            setColumns(prev => [...prev, resp]);
            setLoading(false);
        } catch (err) {
            console.error(err)
            setError("Не удалось добавить колонку");
        } finally {
            setLoading(false);
        }
    }, [activeBoardId]);

    const addBoard = useCallback(async (board: BoardRequest) => {
        setLoading(true);
        try {
            const resp = await dataService.createBoard(board);
            setBoards(prev => prev ? [...prev, resp] : [resp]);
            setBoard(resp);
            setActiveBoardId(resp.id);
            setLoading(false);
        } catch (err) {
            console.error(err)
            setError("Не удалось добавить доску");
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteColumn = useCallback(async (columnId: string) => {
        try {
            await dataService.deleteColumn(columnId);
            setColumns(prev => prev.filter(t => t.id !== columnId));
        } catch (e) {
            const error = e as Error;
            console.log(error.message);
            if (error.message === "Not empty"){
                setError('Колонка не пустая');
                return
            }
            console.error(e);
            setError('Ошибка при удалении колонки');
        }
    }, []);


    const deleteBoard = useCallback(async (boardId: string) => {
        try {
            await dataService.deleteBoard(boardId);
            setBoards(prev => prev.filter(t => t.id !== boardId));
            if (activeBoardId == boardId){
                setActiveBoardId('');
            }
        } catch (e) {
            console.error(e);
            setError('Ошибка при удалении доски');
        }
    }, [activeBoardId]);

    const fetchBoards = useCallback(async () => {
        setLoading(true);
        try {
            const resp = await dataService.getBoards();
            setBoards(resp);
            setLoading(false);
        } catch (err) {
            console.error(err)
            setError("Не удалось добавить доску");
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchBoard = useCallback(async () => {
        setLoading(true);
        if (!activeBoardId || activeBoardId === '') {
            setBoard(null);
            setColumns([]);
            setLoading(false);
            return null;
        }
        try {
            const resp = await dataService.getBoard(activeBoardId);
            setBoard(resp);
            if (resp.columns) {
                setColumns(resp.columns);
            } else {
                setColumns([]);
            }
            setLoading(false);
            return resp
        } catch (err) {
            console.error(err)
            setError("Не удалось открыть доску");
            setBoard(null);
            setColumns([]);
            return null
        } finally {
            setLoading(false);
        }
    }, [activeBoardId]);


    return (
        <BoardContext.Provider
            value={{
                board,
                boards,
                columns,
                loading,
                error,
                activeBoardId,
                addColumnProcess,
                setError,
                setIsAddColumnProcess,
                setBoard,
                setColumns,
                setActiveBoardId,
                addColumn,
                addBoard,
                deleteColumn,
                deleteBoard,
                fetchBoards,
                fetchBoard
            }}
        >
            {children}
        </BoardContext.Provider>
    );
};

export const useBoardContext = () => {
    const context = useContext(BoardContext);
    if (!context) throw new Error('useBoardContext must be used within BoardProvider');
    return context;
};
