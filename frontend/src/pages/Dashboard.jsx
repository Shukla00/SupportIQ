import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Ticket,
    AlertCircle,
    CheckCircle2,
    Clock,
    Sparkles,
    Plus,
    Filter,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { PriorityBadge, TicketStatusBadge } from "../components/StatusBadge";

export default function Dashboard() {
    const [tickets, setTickets] = useState([]);
    const [stats, setStats] = useState({
        total_tickets: 0,
        open_tickets: 0,
        resolved_tickets: 0,
        avg_resolution_hours: 0,
    });
    const [statusFilter, setStatusFilter] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            setLoading(true);
            try {
                const params = {};
                if (statusFilter) params.status = statusFilter;
                if (categoryFilter) params.category = categoryFilter;

                const [ticketsRes, statsRes] = await Promise.all([
                    axiosClient.get("/tickets/", { params }),
                    axiosClient.get("/tickets/analytics/summary/"),
                ]);

                setTickets(ticketsRes.data.results || ticketsRes.data);
                setStats(statsRes.data);
            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [statusFilter, categoryFilter]);

    const kpiCards = [
        {
            label: "Total Tickets",
            value: stats.total_tickets,
            icon: Ticket,
            accent: "border-cerulean/40 text-cerulean",
        },
        {
            label: "Open & Active",
            value: stats.open_tickets,
            icon: AlertCircle,
            accent: "border-neonrose/40 text-neonrose",
        },
        {
            label: "Resolved",
            value: stats.resolved_tickets,
            icon: CheckCircle2,
            accent: "border-status-success/40 text-status-success",
        },
        {
            label: "Avg Resolution Time",
            value: `${stats.avg_resolution_hours || 0}h`,
            icon: Clock,
            accent: "border-status-warning/40 text-status-warning",
        },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-6 max-w-7xl mx-auto"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Support Operations Center</h1>
                    <p className="text-sm text-text-secondary">
                        Real-time ML ticket triage, priority detection, and AI-assisted resolutions.
                    </p>
                </div>
                <Link
                    to="/tickets/new"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cerulean hover:bg-cerulean/90 text-white font-medium text-sm shadow-cerulean-glow transition"
                >
                    <Plus size={16} />
                    New Support Ticket
                </Link>
            </div>

            {/* Staggered Glass KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpiCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.07 }}
                            whileHover={{ y: -3 }}
                            className="glass-panel p-5 rounded-2xl flex items-center justify-between hover:border-cerulean/40 transition"
                        >
                            <div>
                                <p className="text-xs font-medium uppercase tracking-wider text-text-secondary">
                                    {card.label}
                                </p>
                                <p className="text-3xl font-bold mt-2">{loading ? "—" : card.value}</p>
                            </div>
                            <div className={`p-3 rounded-xl bg-white/[0.03] border ${card.accent}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* Filters & Ticket Queue Table */}
            <div className="glass-panel rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-glass-border flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-cerulean" />
                        <h2 className="font-semibold">Live Ticket Queue</h2>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="bg-jet border border-glass-border rounded-xl px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-cerulean"
                        >
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                        </select>

                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="bg-jet border border-glass-border rounded-xl px-3 py-1.5 text-sm text-text-primary focus:outline-none focus:border-cerulean"
                        >
                            <option value="">All ML Categories</option>
                            <option value="billing">Billing</option>
                            <option value="technical_issue">Technical Issue</option>
                            <option value="account_access">Account Access</option>
                            <option value="general_inquiry">General Inquiry</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-glass-border text-xs uppercase text-text-secondary bg-white/[0.01]">
                                <th className="py-3.5 px-5">Ticket</th>
                                <th className="py-3.5 px-5">ML Category</th>
                                <th className="py-3.5 px-5">Priority</th>
                                <th className="py-3.5 px-5">Status</th>
                                <th className="py-3.5 px-5 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-glass-border text-sm">
                            {loading ? (
                                [...Array(4)].map((_, idx) => (
                                    <tr key={idx} className="animate-pulse">
                                        <td className="py-4 px-5" colSpan={5}>
                                            <div className="h-5 bg-white/5 rounded w-full" />
                                        </td>
                                    </tr>
                                ))
                            ) : tickets.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-10 text-center text-text-secondary">
                                        No tickets match the current filter criteria.
                                    </td>
                                </tr>
                            ) : (
                                tickets.map((t) => (
                                    <tr
                                        key={t.id}
                                        className="hover:bg-white/[0.03] transition group"
                                    >
                                        <td className="py-4 px-5">
                                            <p className="font-medium text-text-primary group-hover:text-cerulean transition">
                                                #{t.id} — {t.subject}
                                            </p>
                                            <p className="text-xs text-text-secondary mt-0.5">
                                                Customer: {t.customer_username}
                                            </p>
                                        </td>
                                        <td className="py-4 px-5">
                                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.04] border border-glass-border text-xs">
                                                <Sparkles className="w-3 h-3 text-neonrose" />
                                                {t.category_display || t.category}
                                            </span>
                                        </td>
                                        <td className="py-4 px-5">
                                            <PriorityBadge priority={t.priority} />
                                        </td>
                                        <td className="py-4 px-5">
                                            <TicketStatusBadge status={t.status} />
                                        </td>
                                        <td className="py-4 px-5 text-right">
                                            <Link
                                                to={`/tickets/${t.id}`}
                                                className="px-3 py-1.5 rounded-lg bg-cerulean/15 hover:bg-cerulean text-cerulean hover:text-white border border-cerulean/30 text-xs font-medium transition"
                                            >
                                                Inspect & Reply
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </motion.div>
    );
}