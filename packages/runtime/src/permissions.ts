import { VALID_PERMISSIONS } from '@skillspace/schema';

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

export class PermissionDeniedError extends Error {
  constructor(
    public readonly permission: string,
    public readonly skillName: string,
  ) {
    super(
      `Permission denied: skill "${skillName}" does not declare "${permission}" permission. ` +
        `Add "${permission}" to the permissions array in skill.yaml to allow this action.`,
    );
    this.name = 'PermissionDeniedError';
  }
}

// ---------------------------------------------------------------------------
// Permission Enforcer
// ---------------------------------------------------------------------------

/**
 * Validates runtime actions against a skill's declared permissions.
 * Permission enforcement lives in the SSR, not in skill.yaml — a skill
 * cannot bypass the enforcer.
 */
export class PermissionEnforcer {
  private readonly declared: Set<string>;

  constructor(
    private readonly skillName: string,
    permissions: readonly string[],
  ) {
    this.declared = new Set(permissions);
  }

  /**
   * Check if a permission is declared. Throws PermissionDeniedError if not.
   */
  check(required: string): void {
    if (!this.declared.has(required)) {
      throw new PermissionDeniedError(required, this.skillName);
    }
  }

  /**
   * Check multiple permissions. Throws on the first missing permission.
   */
  checkAll(required: readonly string[]): void {
    for (const perm of required) {
      this.check(perm);
    }
  }

  /**
   * Check if a permission is declared without throwing.
   */
  hasPermission(perm: string): boolean {
    return this.declared.has(perm);
  }

  /**
   * Get all declared permissions.
   */
  getDeclared(): string[] {
    return Array.from(this.declared);
  }

  /**
   * Determine required permissions for a given set of runtime actions.
   */
  static getRequiredPermissions(actions: {
    readsFiles?: boolean;
    writesFiles?: boolean;
    makesNetworkRequests?: boolean;
    usesBrowser?: boolean;
    usesTerminal?: boolean;
  }): string[] {
    const required: string[] = [];
    if (actions.readsFiles) required.push('filesystem.read');
    if (actions.writesFiles) required.push('filesystem.write');
    if (actions.makesNetworkRequests) required.push('network.fetch');
    if (actions.usesBrowser) required.push('tools.browser');
    if (actions.usesTerminal) required.push('tools.terminal');
    return required;
  }

  /**
   * Validate that all permissions in the list are valid permission strings.
   */
  static validatePermissions(permissions: string[]): { valid: boolean; invalid: string[] } {
    const validSet = new Set<string>(VALID_PERMISSIONS);
    const invalid = permissions.filter((p) => !validSet.has(p));
    return { valid: invalid.length === 0, invalid };
  }
}
