/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#F2A100',
          orange: '#F2A100',
          yellow: '#F7B733',
        },
        dark: '#111111',
        light: {
          DEFAULT: '#F5F5F5',
          cream: '#FFF7E6',
          orange: '#FFE4B5',
        },
        success: '#22C55E',
        error: '#EF4444',
        info: '#3B82F6',
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        nunito: ['Nunito', 'sans-serif'],
      },
      borderRadius: {
        'xl': '20px',
        '2xl': '24px',
        '3xl': '32px',
      },
      boxShadow: {
        'soft': '0 4px 20px rgba(0, 0, 0, 0.08)',
        'float': '0 8px 30px rgba(242, 161, 0, 0.15)',
      },
    },
  },
  plugins: [],
}
