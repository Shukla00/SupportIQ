import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
    LayoutDashboard,
    Ticket,
    BookOpen,
    BarChart3,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search,
    Sparkles,
    LogOut,
    User,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Tickets", path: "/tickets", icon: Ticket },
    { name: "Knowledge Base", path: "/kb", icon: BookOpen },
    { name: "Analytics", path: "/analytics", icon: BarChart3 },
];

export default function Layout() {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex bg-jet text-text-primary selection:bg-cerulean selection:text-white">
            {/* Collapsible Glass Sidebar */}
            <motion.aside
                animate={{ width: collapsed ? 80 : 260 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="glass-panel border-r border-glass-border flex flex-col justify-between z-30 sticky top-0 h-screen"
            >
                <div>
                    {/* Brand Logo */}
                    <div className="h-16 flex items-center justify-between px-5 border-b border-glass-border">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cerulean to-neonrose flex items-center justify-center shrink-0 shadow-cerulean-glow">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            {!collapsed && (
                                <span className="font-bold text-lg tracking-tight whitespace-nowrap">
                                    Support<span className="text-cerulean">IQ</span>{" "}
                                    <span className="text-xs px-1.5 py-0.5 rounded bg-neonrose/20 text-neonrose border border-neonrose/40 ml-1">
                                        AI
                                    </span>
                                </span>
                            )}
                        </div>
                        <button
                            onClick={() => setCollapsed(!collapsed)}
                            aria-label="Toggle Sidebar"
                            className="p-1.5 rounded-lg hover:bg-white/10 text-text-secondary hover:text-white transition"
                        >
                            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                        </button>
                    </div>

                    {/* Navigation Links */}
                    <nav className="p-3 space-y-1.5">
                        {navItems.map(({ name, path, icon: Icon }) => (
                            <NavLink
                                key={path}
                                to={path}
                                end={path === "/"}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${isActive
                                        ? "bg-cerulean/20 text-white border border-cerulean/50 shadow-cerulean-glow"
                                        : "text-text-secondary hover:text-white hover:bg-white/5 border border-transparent"
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5 shrink-0" />
                                {!collapsed && <span>{name}</span>}
                            </NavLink>
                        ))}
                    </nav>
                </div>

                {/* User Footer */}
                <div className="p-3 border-t border-glass-border">
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/[0.02] border border-glass-border">
                        <div className="flex items-center gap-2.5 overflow-hidden">
                            <div className="w-8 h-8 rounded-full bg-cerulean/30 border border-cerulean flex items-center justify-center shrink-0">
                                <User size={16} />
                            </div>
                            {!collapsed && (
                                <div className="truncate">
                                    <p className="text-sm font-medium truncate">{user?.username || "Agent"}</p>
                                    <p className="text-xs text-text-secondary uppercase tracking-wider">
                                        {user?.role || "agent"}
                                    </p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            title="Sign Out"
                            className="p-1.5 text-text-secondary hover:text-status-error transition"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </motion.aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Top Glass Navigation Bar */}
                <header className="h-16 glass-panel border-b border-glass-border px-6 flex items-center justify-between sticky top-0 z-20">
                    <div className="relative w-full max-w-md">
                        <Search className="w-4 h-4 text-text-secondary absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            placeholder="Search tickets, customers, or articles..."
                            className="w-full bg-white/[0.03] border border-glass-border rounded-xl pl-10 pr-4 py-1.5 text-sm text-text-primary placeholder-text-secondary focus:outline-none focus:border-cerulean focus:shadow-cerulean-glow transition"
                        />
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            aria-label="Notifications"
                            className="relative p-2 rounded-xl bg-white/[0.03] border border-glass-border hover:border-cerulean/50 transition"
                        >
                            <Bell className="w-4 h-4 text-text-secondary" />
                            <span className="w-2 h-2 rounded-full bg-neonrose absolute top-1.5 right-1.5 shadow-rose-glow" />
                        </button>
                    </div>
                </header>

                {/* Page Outlet with Subtle Motion */}
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}