import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Lock } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        try {
            await login(username, password);
            navigate("/");
        } catch {
            setError("Invalid username or password.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-jet">
            <form
                onSubmit={handleSubmit}
                className="ai-gradient-border w-full max-w-md p-8 rounded-2xl space-y-6"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cerulean to-neonrose flex items-center justify-center shadow-cerulean-glow">
                        <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-text-primary">SupportIQ AI</h1>
                        <p className="text-xs text-text-secondary">Sign in to your support workspace</p>
                    </div>
                </div>

                {error && (
                    <div className="p-3 rounded-xl bg-status-error/15 border border-status-error/40 text-xs text-status-error">
                        {error}
                    </div>
                )}

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs text-text-secondary uppercase mb-1.5">Username</label>
                        <input
                            type="text"
                            required
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-cerulean"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-text-secondary uppercase mb-1.5">Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-white/[0.03] border border-glass-border rounded-xl px-4 py-2.5 text-sm text-text-primary focus:outline-none focus:border-cerulean"
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-cerulean hover:bg-cerulean/90 text-white font-semibold text-sm shadow-cerulean-glow flex items-center justify-center gap-2 transition"
                >
                    <Lock size={15} />
                    Sign In
                </button>
            </form>
        </div>
    );
}