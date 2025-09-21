import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      rotate: {
        'y-180': 'rotateY(180deg)',
      },
      backfaceVisibility: {
        hidden: 'hidden',
      },
    },
  },
  plugins: [],
}
export default config
