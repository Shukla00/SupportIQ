import React from "react";

export const PriorityBadge = ({ priority }) => {
    const styles = {
        high: "bg-status-error/15 text-status-error border-status-error/40",
        medium: "bg-status-warning/15 text-status-warning border-status-warning/40",
        low: "bg-cerulean/15 text-[#38bdf8] border-cerulean/40",
    };

    return (
        <span
            className={`px-2.5 py-0.5 text-xs font-medium rounded-full border uppercase tracking-wider ${styles[priority?.toLowerCase()] || styles.low
                }`}
        >
            {priority || "Low"}
        </span>
    );
};

export const TicketStatusBadge = ({ status }) => {
    const styles = {
        open: "bg-neonrose/15 text-neonrose border-neonrose/40",
        in_progress: "bg-cerulean/20 text-[#38bdf8] border-cerulean/50",
        resolved: "bg-status-success/15 text-status-success border-status-success/40",
        closed: "bg-white/5 text-text-secondary border-white/10",
    };

    const labels = {
        open: "Open",
        in_progress: "In Progress",
        resolved: "Resolved",
        closed: "Closed",
    };

    return (
        <span
            className={`px-2.5 py-1 text-xs font-medium rounded-md border ${styles[status] || styles.open
                }`}
        >
            {labels[status] || status}
        </span>
    );
};