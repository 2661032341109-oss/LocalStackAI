import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        chart: {
          "1": "var(--chart-1)",
          "2": "var(--chart-2)",
          "3": "var(--chart-3)",
          "4": "var(--chart-4)",
          "5": "var(--chart-5)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar-background)",
          foreground: "var(--sidebar-foreground)",
          primary: "var(--sidebar-primary)",
          "primary-foreground": "var(--sidebar-primary-foreground)",
          accent: "var(--sidebar-accent)",
          "accent-foreground": "var(--sidebar-accent-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
        },
        // Custom slate colors for database interface
        slate: {
          50: "hsl(210, 40%, 98%)",
          100: "hsl(210, 40%, 96%)",
          200: "hsl(210, 16.7%, 87.1%)",
          300: "hsl(215, 13.8%, 73.3%)",
          400: "hsl(215, 20.2%, 65.1%)",
          500: "hsl(215, 16.3%, 46.9%)",
          600: "hsl(215, 19.3%, 34.5%)",
          700: "hsl(215, 25%, 26.7%)",
          750: "hsl(215, 25%, 20%)",
          800: "hsl(215, 27.9%, 16.9%)",
          850: "hsl(215, 28%, 12%)",
          900: "hsl(222.2, 84%, 4.9%)",
          950: "hsl(225, 52.2%, 3.5%)",
        },
        blue: {
          400: "hsl(217.2, 91.2%, 69.8%)",
          500: "hsl(217.2, 91.2%, 59.8%)",
          600: "hsl(221.2, 83.2%, 53.3%)",
          700: "hsl(224.3, 76.3%, 48%)",
        },
        emerald: {
          500: "hsl(142.1, 76.2%, 36.3%)",
          600: "hsl(142.1, 70.6%, 45.3%)",
          700: "hsl(142.4, 71.8%, 29.2%)",
        },
        yellow: {
          400: "hsl(54.5, 91.7%, 69.3%)",
        },
        purple: {
          400: "hsl(270.7, 91%, 65.1%)",
          500: "hsl(270.7, 91%, 65.1%)",
        },
        pink: {
          500: "hsl(330.4, 81.2%, 60.4%)",
        },
        green: {
          500: "hsl(142.1, 76.2%, 36.3%)",
        },
        red: {
          400: "hsl(0, 84.2%, 60.2%)",
          500: "hsl(0, 72.2%, 50.6%)",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)"],
        mono: ["JetBrains Mono", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
