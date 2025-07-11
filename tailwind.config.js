/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#283F7A',
        secondary: '#594974',
        tertiary: '#88526F',
        quaternary: '#BC6D5D',
        accent: '#D1CF74',
        neutral: '#40403F',
        muted: '#848585',
        light: '#C6C5C5',
      },
    },
  },
  plugins: [
    require('daisyui'),
  ],
}
