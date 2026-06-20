import tseslint from 'typescript-eslint';
import { skillSpaceRules, skillSpaceIgnores } from '@skillspace/config-eslint';

export default tseslint.config({ ignores: skillSpaceIgnores }, ...tseslint.configs.recommended, skillSpaceRules);
