// UserProvider.tsx
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { dataService } from "../services/dataService";

type AuthStatus = "anon" | "auth" | "loading";

interface UserContextType {
    status: AuthStatus;
    accessToken: string | null;
    error: string | null;

    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;

    // если будет refresh-cookie
    refresh: () => Promise<boolean>;

    clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
    const [status, setStatus] = useState<AuthStatus>("loading");
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const applyToken = useCallback((token: string | null) => {
        setAccessToken(token);
        dataService.setAuthToken?.(token);
    }, []);

    const clearError = useCallback(() => setError(null), []);

    const login = useCallback(async (email: string, password: string) => {
        setError(null);
        setStatus("loading");
        try {
            const token = await dataService.loginUser(email, password);
            applyToken(token);
            setStatus("auth");
            return true;
        } catch (e) {
            setError((e as Error).message ?? "Login error");
            applyToken(null);
            setStatus("anon");
            return false;
        }
    }, [applyToken]);

    const register = useCallback(async (name: string, email: string, password: string) => {
        setError(null);
        setStatus("loading");
        try {
            const token = await dataService.registerUser(name, email, password);
            applyToken(token);
            setStatus("auth");
            return true;
        } catch (e) {
            setError((e as Error).message ?? "Register error");
            applyToken(null);
            setStatus("anon");
            return false;
        }
    }, [applyToken]);

    const refresh = useCallback(async () => {
        //TODO перенаправлять пользователя на страницу авторизации, если refresh-cookie не найден
        setError(null);
        setStatus("loading");
        try {
            const token = await dataService.refreshAccessToken();
            applyToken(token);
            setStatus("auth");
            return true;
        } catch (e) {
            console.error("err", e)
            applyToken(null);
            setStatus("anon");
            return false;
        }
    }, [applyToken]);

    const logout = useCallback(async () => {
        setError(null);
        applyToken(null);
        setStatus("anon");
        // если на бэке есть logout (чтобы очистить refresh-cookie)
        await dataService.logout?.();
    }, [applyToken]);

    // При старте приложения: пробуем восстановить сессию через refresh-cookie
    useEffect(() => {
        refresh();
    }, [refresh]);

    const value = useMemo<UserContextType>(() => ({
        status,
        accessToken,
        error,
        login,
        register,
        logout,
        refresh,
        clearError,
    }), [status, accessToken, error, login, register, logout, refresh, clearError]);

    return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUserContext = () => {
    const ctx = useContext(UserContext);
    if (!ctx) throw new Error("useUserContext must be used within UserProvider");
    return ctx;
};
