import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "var(--bg-ink)",
        panel: "var(--bg-panel)",
        sidebar: "var(--bg-sidebar)",
        line: "var(--border-line)",
        mint: "var(--mint)",
        amber: "var(--warning)",
        danger: "var(--danger)",
        main: "var(--text-main)",
        muted: "var(--text-muted)",
        dim: "var(--text-dim)"
      }
    }
  },
  plugins: []
} satisfies Config;
