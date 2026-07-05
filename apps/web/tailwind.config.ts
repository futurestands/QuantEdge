import type { Config } from "tailwindcss";

export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#07090d",
        panel: "#10141d",
        line: "#263142",
        mint: "#35d0a3",
        amber: "#f5ba45",
        danger: "#ef5d68"
      }
    }
  },
  plugins: []
} satisfies Config;

