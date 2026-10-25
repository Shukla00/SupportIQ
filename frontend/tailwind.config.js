/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                jet: "#0A0A0A",
                cerulean: "#007BA7",
                neonrose: "#FF2095",
                glass: {
                    surface: "rgba(255, 255, 255, 0.04)",
                    border: "rgba(255, 255, 255, 0.10)",
                },
                text: {
                    primary: "#F5F7FA",
                    secondary: "#9CA3AF",
                },
                status: {
                    success: "#22C55E",
                    warning: "#F59E0B",
                    error: "#EF4444",
                },
            },
            boxShadow: {
                "cerulean-glow": "0 0 20px -4px rgba(0, 123, 167, 0.45)",
                "rose-glow": "0 0 20px -4px rgba(255, 32, 149, 0.45)",
            },
        },
    },
    plugins: [],
};