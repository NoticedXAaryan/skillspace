/**
 * Shared SkillSpace ESLint flat-config building blocks.
 *
 * This module intentionally does NOT import `typescript-eslint` at the top
 * level: under pnpm's strict node_modules, `typescript-eslint` is only
 * resolvable from a package that lists it as a direct dependency. Importing it
 * here would break every consumer that does not.
 *
 * Instead, each consuming package composes its own config:
 *
 *   import tseslint from 'typescript-eslint';
 *   import { skillSpaceRules, skillSpaceIgnores } from '@skillspace/config-eslint';
 *
 *   export default tseslint.config(
 *     { ignores: skillSpaceIgnores },
 *     ...tseslint.configs.recommended,
 *     skillSpaceRules,
 *   );
 */

/** Glob patterns every SkillSpace package should ignore when linting. */
export const skillSpaceIgnores = [
  'dist/**',
  'node_modules/**',
  '.next/**',
  'coverage/**',
  '*.config.{js,ts,mjs,cjs}',
  'prisma/migrations/**',
];

/** Shared rule overrides applied on top of typescript-eslint recommended. */
export const skillSpaceRules = {
  rules: {
    '@typescript-eslint/no-unused-vars': [
      'warn',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        caughtErrorsIgnorePattern: '^_',
      },
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-empty-function': 'off',
  },
};
