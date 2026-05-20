/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Noto Sans"', "Inter", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        serif: ['"Instrument Serif"', "Georgia", "serif"],
      },
      colors: {
        white: "var(--white)",
        black: "var(--black)",
        gray: "var(--gray)",
        primary: "var(--primary)",
        "primary-strong": "var(--primary-strong)",
        "primary-soft": "var(--primary-soft)",
        second: "var(--second)",
        hover: "var(--hover-color)",
      },
      borderRadius: {
        chat: "20px",
        card: "10px",
      },
      boxShadow: {
        nextchat: "var(--shadow)",
        card: "var(--card-shadow)",
      },
    },
  },
  plugins: [],
};
