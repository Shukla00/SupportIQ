import React, { createContext, useContext, useState, useEffect } from "react";
import axiosClient from "../api/axiosClient";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchCurrentUser = async () => {
        try {
            const { data } = await axiosClient.get("/auth/me/");
            setUser(data);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (localStorage.getItem("access_token")) {
            fetchCurrentUser();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (username, password) => {
        const { data } = await axiosClient.post("/auth/login/", { username, password });
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);
        await fetchCurrentUser();
    };

    const logout = () => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);