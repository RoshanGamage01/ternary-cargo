import type { Config } from "tailwindcss";
const c = (v: string) => `hsl(var(--${v}) / <alpha-value>)`;
const config: Config = {
  darkMode: "class",
  content: ["./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: {
      border: c("border"), input: c("input"), ring: c("ring"), background: c("background"), foreground: c("foreground"),
      primary: { DEFAULT: c("primary"), foreground: c("primary-foreground") },
      secondary: { DEFAULT: c("secondary"), foreground: c("secondary-foreground") },
      muted: { DEFAULT: c("muted"), foreground: c("muted-foreground") },
      accent: { DEFAULT: c("accent"), foreground: c("accent-foreground") },
      highlight: { DEFAULT: c("highlight"), foreground: c("highlight-foreground") },
      destructive: { DEFAULT: c("destructive"), foreground: c("destructive-foreground") },
      card: { DEFAULT: c("card"), foreground: c("card-foreground") },
      popover: { DEFAULT: c("popover"), foreground: c("popover-foreground") },
      sidebar: { DEFAULT: c("sidebar"), foreground: c("sidebar-foreground"), active: c("sidebar-active") },
      success: c("success"), warning: c("warning"), info: c("info"), danger: c("danger"), neutral: c("neutral"),
      mode: { sea: c("mode-sea"), air: c("mode-air"), road: c("mode-road"), courier: c("mode-courier") },
    },
    borderRadius: { lg: "var(--radius)", md: "calc(var(--radius) - 2px)", sm: "calc(var(--radius) - 4px)" },
    fontFamily: { sans: ["var(--font-inter)", "Inter", "system-ui", "sans-serif"], display: ["var(--font-plex)", "var(--font-inter)", "sans-serif"], mono: ["var(--font-mono)", "ui-monospace", "monospace"] },
  } },
  plugins: [],
};
export default config;
