import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
    Sparkles,
    Send,
    RefreshCw,
    Copy,
    Check,
    BookOpen,
    ShieldAlert,
} from "lucide-react";
import axiosClient from "../api/axiosClient";
import { PriorityBadge, TicketStatusBadge } from "../components/StatusBadge";

export default function TicketDetail() {
    const { id } = useParams();
    const [ticket, setTicket] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [aiSuggestion, setAiSuggestion] = useState("");
    const [referencedArticles, setReferencedArticles] = useState([]);
    const [generatingAi, setGeneratingAi] = useState(false);
    const [copied, setCopied] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const fetchTicket = async () => {
        const { data } = await axiosClient.get(`/tickets/${id}/`);
        setTicket(data);
        if (data.ai_suggested_reply) {
            setAiSuggestion(data.ai_suggested_reply);
        }
    };

    useEffect(() => {
        fetchTicket();
    }, [id]);

    const handleGenerateAiReply = async () => {
        setGeneratingAi(true);
        try {
            const { data } = await axiosClient.post(`/tickets/${id}/generate-ai-reply/`);
            setAiSuggestion(data.suggested_reply);
            setReferencedArticles(data.articles || []);
        } catch (err) {
            console.error("AI generation error:", err);
        } finally {
            setGeneratingAi(false);
        }
    };

    const handleApproveIntoComposer = () => {
        setReplyText(aiSuggestion);
    };

    const handleCopySuggestion = () => {
        navigator.clipboard.writeText(aiSuggestion);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleSendApprovedReply = async (e) => {
        e.preventDefault();
        if (!replyText.trim()) return;
        setSubmitting(true);
        try {
            await axiosClient.post(`/tickets/${id}/messages/`, {
                body: replyText,
            });
            setReplyText("");
            await fetchTicket();
        } finally {
            setSubmitting(false);
        }
    };

    if (!ticket) {
        return <div className="p-8 text-text-secondary animate-pulse">Loading ticket context...</div>;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {/* Left 2 Columns: Conversation Thread & Reply Composer */}
            <div className="lg:col-span-2 space-y-6">
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono text-text-secondary">TICKET #{ticket.id}</span>
                        <div className="flex items-center gap-2">
                            <PriorityBadge priority={ticket.priority} />
                            <TicketStatusBadge status={ticket.status} />
                        </div>
                    </div>
                    <h1 className="text-xl font-bold">{ticket.subject}</h1>
                    <p className="text-sm text-text-secondary whitespace-pre-line">
                        {ticket.description}
                    </p>
                </div>

                {/* Message History */}
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                    <h2 className="font-semibold text-sm uppercase tracking-wider text-text-secondary">
                        Conversation History
                    </h2>
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                        {ticket.messages?.map((msg) => (
                            <div
                                key={msg.id}
                                className={`p-4 rounded-xl border ${msg.sender_role !== "customer"
                                        ? "bg-cerulean/10 border-cerulean/30 ml-6"
                                        : "bg-white/[0.03] border-glass-border mr-6"
                                    }`}
                            >
                                <div className="flex justify-between text-xs text-text-secondary mb-1.5">
                                    <span className="font-semibold text-text-primary">
                                        {msg.sender_username} ({msg.sender_role})
                                    </span>
                                    <span>{new Date(msg.created_at).toLocaleString()}</span>
                                </div>
                                <p className="text-sm whitespace-pre-line">{msg.body}</p>
                            </div>
                        ))}
                    </div>

                    {/* Human-Approved Reply Composer */}
                    <form onSubmit={handleSendApprovedReply} className="pt-4 border-t border-glass-border space-y-3">
                        <label className="block text-xs font-medium text-text-secondary uppercase tracking-wider">
                            Agent Response Composer (Human Approval Required Before Sending)
                        </label>
                        <textarea
                            rows={4}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            placeholder="Write a reply or click 'Use & Edit Suggestion' from the SupportIQ AI panel..."
                            className="w-full bg-jet border border-glass-border rounded-xl p-3.5 text-sm text-text-primary focus:outline-none focus:border-cerulean focus:shadow-cerulean-glow transition"
                        />
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || !replyText.trim()}
                                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cerulean hover:bg-cerulean/90 disabled:opacity-40 text-white text-sm font-medium shadow-cerulean-glow transition"
                            >
                                <Send size={15} />
                                {submitting ? "Sending..." : "Approve & Send Reply"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* Right Column: SupportIQ AI Assistant Panel */}
            <div className="space-y-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="ai-gradient-border p-6 rounded-2xl space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-neonrose" />
                            <h2 className="font-bold text-base">SupportIQ AI Copilot</h2>
                        </div>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-neonrose/20 text-neonrose border border-neonrose/40 font-medium">
                            Qwen 2.5 7B
                        </span>
                    </div>

                    <p className="text-xs text-text-secondary">
                        Generates context-aware responses grounded in your Knowledge Base. Replies are never sent without agent review.
                    </p>

                    {generatingAi ? (
                        <div className="py-8 flex flex-col items-center justify-center gap-3 text-center">
                            <RefreshCw className="w-6 h-6 text-neonrose animate-spin" />
                            <p className="text-xs text-text-secondary animate-pulse">
                                Retrieving Knowledge Base articles & drafting response...
                            </p>
                        </div>
                    ) : aiSuggestion ? (
                        <div className="space-y-3">
                            <div className="p-3.5 rounded-xl bg-white/[0.03] border border-glass-border text-sm text-text-primary whitespace-pre-line max-h-72 overflow-y-auto">
                                {aiSuggestion}
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={handleApproveIntoComposer}
                                    className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-cerulean to-neonrose text-white text-xs font-semibold shadow-rose-glow hover:opacity-95 transition"
                                >
                                    Use & Edit Suggestion
                                </button>
                                <button
                                    type="button"
                                    onClick={handleCopySuggestion}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-glass-border text-text-secondary hover:text-white transition"
                                    title="Copy suggestion"
                                >
                                    {copied ? <Check size={15} className="text-status-success" /> : <Copy size={15} />}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleGenerateAiReply}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-glass-border text-text-secondary hover:text-white transition"
                                    title="Regenerate"
                                >
                                    <RefreshCw size={15} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            type="button"
                            onClick={handleGenerateAiReply}
                            className="w-full py-2.5 px-4 rounded-xl bg-cerulean/20 hover:bg-cerulean/30 border border-cerulean/50 text-white text-xs font-semibold shadow-cerulean-glow flex items-center justify-center gap-2 transition"
                        >
                            <Sparkles size={15} className="text-neonrose" />
                            Generate AI Draft Reply
                        </button>
                    )}

                    {/* Grounded Knowledge Articles Used */}
                    {referencedArticles.length > 0 && (
                        <div className="pt-3 border-t border-glass-border space-y-2">
                            <p className="text-xs font-medium text-text-secondary flex items-center gap-1.5">
                                <BookOpen size={13} className="text-cerulean" />
                                Grounded KB Sources:
                            </p>
                            {referencedArticles.map((art) => (
                                <div
                                    key={art.id}
                                    className="text-xs p-2 rounded-lg bg-white/[0.02] border border-glass-border text-text-primary"
                                >
                                    {art.title}
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-text-secondary pt-2">
                        <ShieldAlert size={14} className="text-status-warning shrink-0" />
                        <span>Human-in-the-loop enforced: Review draft in composer before sending.</span>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}