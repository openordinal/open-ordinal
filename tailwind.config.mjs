/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        paper: "var(--paper)",
        ink: "var(--ink)",
        dim: "var(--dim)",
        rule: "var(--rule)",
        accent: "var(--accent)",
        "accent-green": "var(--accent-green)",
        "accent-brown": "var(--accent-brown)",
        "accent-purple": "var(--accent-purple)",
        negative: "var(--negative)"
      },
      fontFamily: {
        serif: ["'EB Garamond'", "serif"],
        mono: ["'Geist Mono'", "monospace"]
      },
      maxWidth: {
        content: "740px"
      }
    }
  },
  plugins: []
};
