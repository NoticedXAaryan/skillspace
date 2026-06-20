import tseslint from 'typescript-eslint';
import nextPlugin from '@next/eslint-plugin-next';
import { skillSpaceRules, skillSpaceIgnores } from '@skillspace/config-eslint';

export default tseslint.config(
  {
    ignores: [
      ...skillSpaceIgnores,
      '.next/**',
      'out/**',
      'next-env.d.ts',
      'prisma/migrations/**',
      'content/**',
      '*.config.{js,ts,mjs,cjs}',
    ],
  },
  ...tseslint.configs.recommended,
  skillSpaceRules,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },
);
