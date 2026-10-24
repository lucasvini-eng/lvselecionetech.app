/**
 * Paleta extraída da logo LVSelecioneTech:
 *  - navy:   fundo azul-marinho profundo do círculo
 *  - cyan:   anel neon e "Tech" (ciano elétrico)
 *  - brand:  azul elétrico do "V" e do "LVS" do texto
 *  - silver: branco prateado das letras "L" e "S"
 */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#020B24',
          900: '#041335',
          800: '#071C4D',
          700: '#0B2A6B',
          600: '#12399A'
        },
        brand: {
          400: '#3D8BFF',
          500: '#1A6CFF',
          600: '#0A52E0'
        },
        cyan: {
          300: '#7DEBFF',
          400: '#2FE0FF',
          500: '#00CFF5'
        },
        silver: {
          50: '#F5F8FF',
          100: '#E8EEFB',
          200: '#CBD6EE',
          400: '#8EA0C7'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        display: ['"Space Grotesk"', 'Inter', 'system-ui', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 24px rgba(47, 224, 255, 0.35)',
        card: '0 8px 24px rgba(2, 11, 36, 0.35)'
      },
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #00CFF5 0%, #1A6CFF 100%)'
      }
    }
  },
  plugins: []
}
