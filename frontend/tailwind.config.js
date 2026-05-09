/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'IBM Plex Mono'", "monospace"],
        sans: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        ink: "#0a0a0f",
        surface: "#111118",
        card: "#16161f",
        border: "#2a2a3a",
        accent: "#6ee7b7",
        accent2: "#818cf8",
        muted: "#6b7280",
        highlight: "#fbbf24",
      },
    },
  },
  plugins: [],
};
