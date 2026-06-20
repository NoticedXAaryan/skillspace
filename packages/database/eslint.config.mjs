import tseslint from 'typescript-eslint';
import { skillSpaceRules, skillSpaceIgnores } from '@skillspace/config-eslint';

export default tseslint.config(
  { ignores: [...skillSpaceIgnores, 'test-db.js', '*.js'] },
  ...tseslint.configs.recommended,
  skillSpaceRules,
);
