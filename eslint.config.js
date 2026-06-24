import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'seed.js',
    'src/pages/literacy/**',
    'src/pages/cognitive-sel/**',
    'src/pages/analytics/**',
    'src/pages/auth/**',
    'src/pages/parent/**',
    'src/pages/teacher/**',
    'src/pages/admin/**',
    'src/pages/settings/**',
    'src/pages/child/**',
    'src/pages/numeracy/**',
    'src/components/layout/**',
    'src/components/shared/**',
    'src/components/literacy/**',
    'src/components/analytics/**',
    'src/context/**',
    'src/firebase/literacyService.js',
    'src/theme/theme.js',
    'src/hooks/useStreak.js'
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
