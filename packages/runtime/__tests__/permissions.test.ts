import { describe, it, expect } from 'vitest';
import { PermissionEnforcer, PermissionDeniedError } from '../src/permissions.js';

describe('PermissionEnforcer', () => {
  it('allows declared permissions', () => {
    const enforcer = new PermissionEnforcer('test-skill', ['filesystem.read', 'network.fetch']);
    expect(() => enforcer.check('filesystem.read')).not.toThrow();
    expect(() => enforcer.check('network.fetch')).not.toThrow();
  });

  it('throws PermissionDeniedError for undeclared permissions', () => {
    const enforcer = new PermissionEnforcer('test-skill', ['filesystem.read']);
    expect(() => enforcer.check('filesystem.write')).toThrow(PermissionDeniedError);
    expect(() => enforcer.check('network.fetch')).toThrow(PermissionDeniedError);
  });

  it('includes skill name in error message', () => {
    const enforcer = new PermissionEnforcer('my-skill', []);
    try {
      enforcer.check('filesystem.read');
    } catch (e) {
      expect(e).toBeInstanceOf(PermissionDeniedError);
      expect((e as PermissionDeniedError).message).toContain('my-skill');
      expect((e as PermissionDeniedError).permission).toBe('filesystem.read');
      expect((e as PermissionDeniedError).skillName).toBe('my-skill');
    }
  });

  it('blocks everything with empty permissions', () => {
    const enforcer = new PermissionEnforcer('restricted-skill', []);
    expect(() => enforcer.check('filesystem.read')).toThrow();
    expect(() => enforcer.check('filesystem.write')).toThrow();
    expect(() => enforcer.check('network.fetch')).toThrow();
    expect(() => enforcer.check('tools.browser')).toThrow();
    expect(() => enforcer.check('tools.terminal')).toThrow();
  });

  it('checkAll throws on first missing permission', () => {
    const enforcer = new PermissionEnforcer('test', ['filesystem.read']);
    expect(() => enforcer.checkAll(['filesystem.read', 'network.fetch'])).toThrow(
      PermissionDeniedError,
    );
  });

  it('hasPermission returns boolean without throwing', () => {
    const enforcer = new PermissionEnforcer('test', ['filesystem.read']);
    expect(enforcer.hasPermission('filesystem.read')).toBe(true);
    expect(enforcer.hasPermission('filesystem.write')).toBe(false);
  });

  it('getDeclared returns all declared permissions', () => {
    const enforcer = new PermissionEnforcer('test', ['filesystem.read', 'network.fetch']);
    expect(enforcer.getDeclared()).toContain('filesystem.read');
    expect(enforcer.getDeclared()).toContain('network.fetch');
    expect(enforcer.getDeclared()).toHaveLength(2);
  });

  it('validatePermissions identifies invalid permissions', () => {
    const result = PermissionEnforcer.validatePermissions([
      'filesystem.read',
      'invalid.perm',
      'network.fetch',
      'bad.one',
    ]);
    expect(result.valid).toBe(false);
    expect(result.invalid).toContain('invalid.perm');
    expect(result.invalid).toContain('bad.one');
    expect(result.invalid).toHaveLength(2);
  });

  it('validatePermissions returns valid for correct permissions', () => {
    const result = PermissionEnforcer.validatePermissions([
      'filesystem.read',
      'filesystem.write',
      'network.fetch',
    ]);
    expect(result.valid).toBe(true);
    expect(result.invalid).toHaveLength(0);
  });
});
