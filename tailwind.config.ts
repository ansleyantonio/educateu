import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
  darkMode: ["class"], // Enable dark mode using class
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}", // Pages
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}", // Components
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}", // App directory
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"], // Default font
        inter: ["var(--font-inter)"], // Inter font
        advent: ["var(--font-adentPro)"], // Advent Pro font
      },

      colors: {
        // Custom button colors
        button: {
          primary: {
            DEFAULT: "#013E5B",
            hover: "#34657c",
            text: "#ffffff",
          },
          confirm: {
            DEFAULT: "#AAEFC6",
            hover: "#91D8B2",
            text: "#064E3B",
          },
          cancel: {
            DEFAULT: "#FECDCA",
            hover: "#F8B4A4",
            text: "#7F1D1D",
          },
          destructive: {
            DEFAULT: "#DC2626",
            hover: "#B91C1C",
            text: "#ffffff",
          },
          success: {
            DEFAULT: "#1D7C4D",
            hover: "#166534",
            text: "#ffffff",
          },
          outline: {
            border: "#E1E5E7",
            hover: "#F3F4F6",
            text: "#111827",
          },
          secondary: {
            DEFAULT: "#E5E7EB",
            hover: "#D1D5DB",
            text: "#111827",
          },
          tooltip: {
            DEFAULT: "#F9FAFB",
            hover: "#F3F4F6",
            text: "#111827",
          },
          icon: {
            border: "#E1E5E7",
            hoverBorder: "#2563EB",
            hoverBg: "#F3F4F6",
            text: "#111827",
          },
          primaryIcon: {
            DEFAULT: "#013E5B",
            hover: "#34657c",
            text: "#ffffff",
          },
          update: {
            border: "#34657c",
            hoverBorder: "#274C63",
            bg: "#ffffff",
            hoverBg: "#F3F4F6",
            text: "#111827",
          },
        },

        // Theme base colors
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",

        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },

        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },

        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },

        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },

        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },

        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // Chart colors
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      // Accordion animations
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [tailwindcssAnimate], // Animation plugin
};

export default config;
