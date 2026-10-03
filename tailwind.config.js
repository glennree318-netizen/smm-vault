/** Tailwind config - SMM Vault
 * Design tokens tuned for ASTIGMATISM legibility:
 * - Larger base type (17px), no 14px text anywhere
 * - Weight floor 500 (no light/thin 300)
 * - Muted text stays light (#B0B7C3) - never dimmed to unreadable grey
 * - 2px borders, 48px min tap targets
 * - Letter spacing +0.01em, generous line height
 * - Background near-black (#0F0F0F), NOT pure black - reduces halation
 * - Text #E8EAED, NOT pure white - reduces blur/halation on light strokes
 */
module.exports = {
  content: ["./src/**/*.jsx", "./index.html"],
  theme: {
    extend: {
      colors: {
        ink: {
          bg: "#0F0F0F",
          surface: "#1C1C1E",
          raised: "#262628",
          line: "#3A3A3E",
          text: "#E8EAED",
          dim: "#B0B7C3",
          faint: "#8E959F",
        },
        brand: {
          DEFAULT: "#FF69B4",
          dark: "#E0509A",
        },
        done: {
          DEFAULT: "#4CAF50",
          dark: "#3D8B41",
        },
        warn: {
          DEFAULT: "#F0B429",
        },
      },
      fontSize: {
        xs: ["0.875rem", "1.5rem"], // 14px - ONLY for legal/meta text
        sm: ["1rem", "1.65rem"], // 16px - floor for real content
        base: ["1.0625rem", "1.8rem"], // 17px - DEFAULT
        lg: ["1.25rem", "2rem"], // 20px
        xl: ["1.5rem", "2.2rem"], // 24px
        "2xl": ["1.875rem", "2.4rem"], // 30px
        "3xl": ["2.25rem", "2.6rem"], // 36px
        day: ["4rem", "4.4rem"], // 64px - the day number hero
      },
      fontWeight: {
        normal: "500",
        medium: "600",
        semibold: "600",
        bold: "700",
      },
      letterSpacing: {
        tightest: "-0.01em",
        normal: "0.01em",
        wide: "0.03em",
      },
      lineHeight: {
        relaxed: "1.75",
        roomy: "2",
      },
      borderWidth: {
        DEFAULT: "2px",
        3: "3px",
        4: "4px",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.125rem",
        "3xl": "1.5rem",
      },
      minHeight: {
        tap: "3rem", // 48px minimum tap target
        safe: "3rem",
      },
      spacing: {
        safe: "env(safe-area-inset-bottom, 0px)",
      },
      boxShadow: {
        card: "0 2px 12px rgba(0,0,0,0.45)",
        lift: "0 6px 20px rgba(0,0,0,0.6)",
      },
    },
  },
  plugins: [],
};