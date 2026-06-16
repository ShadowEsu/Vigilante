import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#000000",
        edge: "rgba(255,255,255,0.08)",
        fg: "rgba(255,255,255,0.92)",
        dim: "rgba(255,255,255,0.45)",
        muted: "rgba(255,255,255,0.35)",
        faint: "rgba(255,255,255,0.25)",
      },
      fontFamily: {
        mono: [
          "var(--font-jetbrains-mono)",
          "JetBrains Mono",
          "ui-monospace",
          "monospace",
        ],
      },
      fontSize: {
        xs: ["10px", "1.4"],
        sm: ["11.5px", "1.45"],
        base: ["13px", "1.5"],
      },
      letterSpacing: {
        wide: "0.14em",
        wider: "0.22em",
      },
    },
  },
  plugins: [],
};

export default config;
