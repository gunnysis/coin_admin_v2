/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Semantic: Design Improvement Plan
        primary: {
          DEFAULT: "#2563EB", // blue-600, Brand
          light: "#3b82f6",
          dark: "#1d4ed8",
        },
        expense: {
          DEFAULT: "#F43F5E", // rose-500, 지출/삭제
          light: "#fb7185",
          dark: "#e11d48",
        },
        income: {
          DEFAULT: "#14B8A6", // teal-500, 절약/수입
          light: "#2dd4bf",
          dark: "#0d9488",
        },
        // Neutral: slate scale
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
        },
      },
      borderRadius: {
        "card": "16px",   // rounded-2xl, 카드
        "button": "12px", // rounded-xl, 버튼
        "input": "8px",   // rounded-lg, 입력 필드
      },
      fontVariant: {
        "tabular-nums": "tabular-nums",
      },
    },
  },
  plugins: [],
};
