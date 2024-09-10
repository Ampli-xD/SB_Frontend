/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
    theme: {
      extend: {
        colors: {
          primary: '#1a202c',
          secondary: '#f7fafc',
          accent: '#4a5568',
        },
      },
    },
    plugins: [],
  }