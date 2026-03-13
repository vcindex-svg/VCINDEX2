/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        surface:     "hsl(var(--surface))",
        "surface-2": "hsl(var(--surface-2))",
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
      },
      fontFamily: {
        space: ["var(--font-space)"],
        mono:  ["var(--font-mono)"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "border-spin": "borderSpin 4s linear infinite",
        "float-y":     "floatY 4s ease-in-out infinite",
        "pulse-glow":  "pulseGlow 3s ease-in-out infinite",
      },
    },
  },
  safelist: [
    "bg-yellow-500/10", "border-yellow-500/30", "text-yellow-400",
    "bg-purple-500/10", "border-purple-500/30", "text-purple-400",
    "bg-blue-500/10",   "border-blue-500/30",   "text-blue-400",
    "bg-pink-500/10",   "border-pink-500/30",   "text-pink-400",
    "bg-green-500/10",  "border-green-500/30",  "text-green-400",
    "bg-amber-500/10",  "border-amber-500/30",  "text-amber-400",
    "bg-indigo-500/10", "border-indigo-500/30", "text-indigo-400",
    "bg-cyan-500/10",   "border-cyan-500/30",   "text-cyan-400",
    "bg-violet-500/10", "border-violet-500/30", "text-violet-400",
    "bg-red-500/10",    "border-red-500/30",    "text-red-400",
    "bg-emerald-500/10","border-emerald-500/30","text-emerald-400",
  ],
  plugins: [require("tailwindcss-animate")],
};