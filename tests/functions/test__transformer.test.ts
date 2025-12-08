import { describe, expect, test } from 'bun:test';
import { TypeTransformer } from '@/core/common/transformer';
import type { ParsedType } from '@/types/parsed';

describe('TypeTransformer', () => {
  test('extracts simple object to registry', () => {
    const ast: ParsedType = {
      kind: 'object',
      properties: [
        { key: 'name', type: { kind: 'string' }, optional: false },
        { key: 'age', type: { kind: 'number' }, optional: false },
      ],
    };
    const transformer = new TypeTransformer('User');
    const { root, registry } = transformer.transform(ast);

    expect(root.kind).toBe('reference');
    if (root.kind === 'reference') {
      expect(root.name).toBe('User');
    }
    expect(registry.size).toBe(1);
    expect(registry.has('User')).toBe(true);
  });

  test('extracts nested objects', () => {
    const ast: ParsedType = {
      kind: 'object',
      properties: [
        {
          key: 'user',
          type: {
            kind: 'object',
            properties: [
              { key: 'name', type: { kind: 'string' }, optional: false },
              { key: 'age', type: { kind: 'number' }, optional: false },
            ],
          },
          optional: false,
        },
        { key: 'active', type: { kind: 'boolean' }, optional: false },
      ],
    };
    const transformer = new TypeTransformer('Response');
    const { registry } = transformer.transform(ast);

    expect(registry.size).toBe(2);
    expect(registry.has('Response')).toBe(true);
    expect(registry.has('User')).toBe(true);
  });

  test('handles array types with singular names', () => {
    const ast: ParsedType = {
      kind: 'object',
      properties: [
        {
          key: 'users',
          type: {
            kind: 'array',
            itemType: {
              kind: 'object',
              properties: [{ key: 'name', type: { kind: 'string' }, optional: false }],
            },
          },
          optional: false,
        },
      ],
    };
    const transformer = new TypeTransformer('ApiResponse');
    const { registry } = transformer.transform(ast);

    expect(registry.has('User')).toBe(true);
  });

  test('generates unique names for duplicate types', () => {
    const ast: ParsedType = {
      kind: 'object',
      properties: [
        {
          key: 'user',
          type: {
            kind: 'object',
            properties: [{ key: 'name', type: { kind: 'string' }, optional: false }],
          },
          optional: false,
        },
        {
          key: 'admin',
          type: {
            kind: 'object',
            properties: [{ key: 'name', type: { kind: 'string' }, optional: false }],
          },
          optional: false,
        },
      ],
    };
    const transformer = new TypeTransformer('App');
    const { registry } = transformer.transform(ast);

    expect(registry.has('User')).toBe(true);
    expect(registry.has('Admin')).toBe(true);
    expect(registry.has('App')).toBe(true);
    expect(registry.size).toBe(3);
  });

  test('preserves primitive types', () => {
    const ast: ParsedType = { kind: 'string' };
    const transformer = new TypeTransformer('MyString');
    const { root, registry } = transformer.transform(ast);

    expect(root.kind).toBe('string');
    expect(registry.size).toBe(0);
  });

  test('handles union types', () => {
    const ast: ParsedType = {
      kind: 'array',
      itemType: {
        kind: 'union',
        types: [{ kind: 'string' }, { kind: 'number' }],
      },
    };
    const transformer = new TypeTransformer('Mixed');
    const { root } = transformer.transform(ast);

    expect(root.kind).toBe('array');
  });
});
