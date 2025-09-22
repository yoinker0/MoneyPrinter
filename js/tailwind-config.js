/**
 * Tailwind CSS configuration
 */

tailwind.config = {
    theme: {
        extend: {
            colors: {
                'brand-pink': '#E91E63',
                'brand-pink-dark': '#c51162',
                'dark-bg': '#121212',
                'dark-card': '#1a1a1a',
                'dark-border': '#333',
                'light-text': '#E0E0E0'
            },
            fontFamily: {
                'inter': ['Inter', 'sans-serif'],
                'roboto': ['Roboto', 'sans-serif']
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-out',
                'spin-slow': 'spin 2s linear infinite'
            },
            screens: {
                'xs': '375px'
            }
        }
    },
    plugins: []
}