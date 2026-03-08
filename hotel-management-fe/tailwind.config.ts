import type { Config } from 'tailwindcss'
import animate from 'tailwindcss-animate'

/**
 * Scale factor to compensate for html { font-size: 10px } (instead of default 16px).
 * Tailwind's default rem values assume 1rem = 16px.
 * With 10px base, we multiply by 1.6 so utility classes produce the same pixel sizes.
 * e.g. `p-4` = 1rem * 1.6 = 1.6rem = 16px (same as default Tailwind behavior)
 */
const SCALE = 1.6

// Generate scaled spacing map (Tailwind defaults × 1.6)
const defaultSpacing: Record<string, number> = {
  '0.5': 0.125, '1': 0.25, '1.5': 0.375, '2': 0.5, '2.5': 0.625,
  '3': 0.75, '3.5': 0.875, '4': 1, '5': 1.25, '6': 1.5,
  '7': 1.75, '8': 2, '9': 2.25, '10': 2.5, '11': 2.75,
  '12': 3, '14': 3.5, '16': 4, '20': 5, '24': 6,
  '28': 7, '32': 8, '36': 9, '40': 10, '44': 11,
  '48': 12, '52': 13, '56': 14, '60': 15, '64': 16,
  '72': 18, '80': 20, '96': 24,
}

const spacing: Record<string, string> = { '0': '0px', px: '1px' }
for (const [key, rem] of Object.entries(defaultSpacing)) {
  const scaled = rem * SCALE
  spacing[key] = `${Number(scaled.toFixed(4))}rem`
}

// Generate scaled fontSize map
const defaultFontSize: Record<string, [string, Record<string, string>]> = {
  xs: ['0.75rem', { lineHeight: '1rem' }],
  sm: ['0.875rem', { lineHeight: '1.25rem' }],
  base: ['1rem', { lineHeight: '1.5rem' }],
  lg: ['1.125rem', { lineHeight: '1.75rem' }],
  xl: ['1.25rem', { lineHeight: '1.75rem' }],
  '2xl': ['1.5rem', { lineHeight: '2rem' }],
  '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
  '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
  '5xl': ['3rem', { lineHeight: '1' }],
  '6xl': ['3.75rem', { lineHeight: '1' }],
  '7xl': ['4.5rem', { lineHeight: '1' }],
  '8xl': ['6rem', { lineHeight: '1' }],
  '9xl': ['8rem', { lineHeight: '1' }],
}

const fontSize: Record<string, [string, Record<string, string>]> = {}
for (const [key, [size, meta]] of Object.entries(defaultFontSize)) {
  const scaledSize = Number.parseFloat(size) * SCALE
  const lh = meta.lineHeight
  const scaledLh = lh === '1' ? '1' : `${Number((Number.parseFloat(lh) * SCALE).toFixed(4))}rem`
  fontSize[key] = [`${Number(scaledSize.toFixed(4))}rem`, { lineHeight: scaledLh }]
}

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    spacing,
    fontSize,
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        gray: {
          DEFAULT: 'hsl(var(--gray))',
          eee: 'hsl(var(--gray-eee))',
          '4F5': 'hsl(var(--gray-4F5))',
        },
        red: {
          DEFAULT: 'hsl(var(--red))',
          '000': 'hsl(var(--red-000))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'collapsible-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-collapsible-content-height)' },
        },
        'collapsible-up': {
          from: { height: 'var(--radix-collapsible-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'collapsible-down': 'collapsible-down 0.2s ease-out',
        'collapsible-up': 'collapsible-up 0.2s ease-out',
      },
    },
  },
  plugins: [animate],
}

export default config
