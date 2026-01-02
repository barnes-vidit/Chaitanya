/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#5DADE2', // Soft Blue
                    foreground: '#FFFFFF',
                    dark: '#3498DB',
                },
                secondary: {
                    DEFAULT: '#58D68D', // Gentle Green
                    foreground: '#FFFFFF',
                },
                accent: {
                    DEFAULT: '#EB984E', // Warm Orange
                    foreground: '#FFFFFF',
                },
                support: {
                    DEFAULT: '#F5B7B1', // Soft Pink
                },
                background: {
                    DEFAULT: '#FAFAFA', // Off-white
                    dark: '#1a1a1a',
                },
                surface: {
                    DEFAULT: '#FFFFFF',
                    dark: '#2d2d2d',
                },
                text: {
                    primary: '#2C3E50', // Dark Blue-Gray
                    secondary: '#7F8C8D', // Soft Gray
                }
            },
            borderRadius: {
                lg: '16px', // 16px
                xl: '24px', // 24px
                '2xl': '32px',
            },
            fontFamily: {
                sans: ['Outfit', 'Inter', 'Nunito', 'sans-serif'],
            },
            boxShadow: {
                'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
                'card': '0 0 0 1px rgba(0,0,0,0.03), 0 2px 8px rgba(0,0,0,0.04)',
            }
        },
    },
    plugins: [],
}
