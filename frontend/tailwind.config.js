/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-primary':    'var(--bg-primary)',
        'bg-secondary':  'var(--bg-secondary)',
        'bg-card':       'var(--bg-card)',
        'border-glass':  'var(--border-glass)',
        'border-basic':  'var(--border-basic)',
        'text-primary':  'var(--text-primary)',
        'text-secondary':'var(--text-secondary)',
        'text-muted':    'var(--text-muted)',
        'accent-blue':   'var(--accent-blue)',
        'accent-cyan':   'var(--accent-cyan)',
        'accent-purple': 'var(--accent-purple)',
        'accent-emerald':'var(--accent-emerald)',
        'accent-rose':   'var(--accent-rose)',
        'accent-amber':  'var(--accent-amber)',
      },
    },
  },
  plugins: [],
}
