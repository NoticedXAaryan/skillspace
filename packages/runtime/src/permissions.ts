// v2 uses freeform permission strings. This list is kept for backward compatibility
// with v1 skills that declare permissions from this fixed set.
const VALID_PERMISSIONS = [
  'filesystem.read',
  'filesystem.write',
  'network.fetch',
  'tools.browser',
  'tools.terminal',
] as const;

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
    console.warn(`[Permission] Agent/Skill "${this.skillName}" is exercising declared permission: ${required}`);
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

// ---------------------------------------------------------------------------
// Allowlist Enforcer
// ---------------------------------------------------------------------------

import { getAllowlist } from './config.js';

export class NotAllowlistedError extends Error {
  constructor(public readonly skillName: string) {
    super(
      `Execution blocked: skill "${skillName}" is not on the organization allowlist. ` +
        `Contact your administrator to add this package.`,
    );
    this.name = 'NotAllowlistedError';
  }
}

/**
 * Validates a skill name against the organization allowlist.
 */
export class AllowlistEnforcer {
  static check(skillName: string): void {
    const allowlist = getAllowlist();
    if (allowlist && allowlist.length > 0) {
      // Direct exact match
      if (allowlist.includes(skillName)) return;

      // Scope match (e.g. "@skillspace/*")
      const isScopeAllowed = allowlist.some((allowed) => {
        if (allowed.endsWith('/*') && skillName.startsWith(allowed.replace('/*', '/'))) {
          return true;
        }
        return false;
      });

      if (!isScopeAllowed) {
        throw new NotAllowlistedError(skillName);
      }
    }
  }
}
