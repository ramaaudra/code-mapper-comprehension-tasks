/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}'
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      fontFamily: {
        sans: ['Atkinson Hyperlegible Next', 'sans-serif'],
        mono: ['Atkinson Hyperlegible Mono', 'monospace'],
        data: ['Atkinson Hyperlegible Next', 'sans-serif']
      },
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        status: {
          critical: {
            DEFAULT: 'hsl(var(--status-critical-solid))',
            surface: 'hsl(var(--status-critical-surface))',
            border: 'hsl(var(--status-critical-border))',
            foreground: 'hsl(var(--status-critical-foreground))',
            solid: 'hsl(var(--status-critical-solid))'
          },
          warning: {
            DEFAULT: 'hsl(var(--status-warning-solid))',
            surface: 'hsl(var(--status-warning-surface))',
            border: 'hsl(var(--status-warning-border))',
            foreground: 'hsl(var(--status-warning-foreground))',
            solid: 'hsl(var(--status-warning-solid))'
          },
          caution: {
            DEFAULT: 'hsl(var(--status-caution-solid))',
            surface: 'hsl(var(--status-caution-surface))',
            border: 'hsl(var(--status-caution-border))',
            foreground: 'hsl(var(--status-caution-foreground))',
            solid: 'hsl(var(--status-caution-solid))'
          },
          success: {
            DEFAULT: 'hsl(var(--status-success-solid))',
            surface: 'hsl(var(--status-success-surface))',
            border: 'hsl(var(--status-success-border))',
            foreground: 'hsl(var(--status-success-foreground))',
            solid: 'hsl(var(--status-success-solid))'
          }
        },
        guide: {
          quick: {
            surface: 'hsl(var(--guide-quick-surface))',
            border: 'hsl(var(--guide-quick-border))'
          },
          reference: {
            surface: 'hsl(var(--guide-reference-surface))',
            border: 'hsl(var(--guide-reference-border))'
          },
          core: {
            surface: 'hsl(var(--guide-core-surface))',
            border: 'hsl(var(--guide-core-border))',
            foreground: 'hsl(var(--guide-core-foreground))'
          },
          derived: {
            surface: 'hsl(var(--guide-derived-surface))',
            border: 'hsl(var(--guide-derived-border))',
            foreground: 'hsl(var(--guide-derived-foreground))'
          },
          review: {
            surface: 'hsl(var(--guide-review-surface))',
            border: 'hsl(var(--guide-review-border))',
            foreground: 'hsl(var(--guide-review-foreground))'
          },
          neutral: {
            foreground: 'hsl(var(--guide-neutral-foreground))'
          }
        }
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '1.4' }],
        'metric': ['2rem', { lineHeight: '1.2' }],
        'metric-lg': ['2.25rem', { lineHeight: '1.2' }]
      },
      letterSpacing: {
        label: '0.08em'
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        xl: '1rem',
        '2xl': '1.25rem'
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' }
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' }
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    }
  },
  plugins: [require('tailwindcss-animate')]
}
