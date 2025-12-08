import { describe, expect, test } from 'bun:test';
import { genTypeCode } from '@/core/common/emitter';
import type { ParsedType, TypeRegistry } from '@/types/parsed';

describe('genTypeCode', () => {
  test('generates simple type alias', () => {
    const root: ParsedType = { kind: 'string' };
    const registry: TypeRegistry = new Map();
    const code = genTypeCode(root, registry, 'MyString');

    expect(code).toBe('export type MyString = string;');
  });

  test('generates array type alias', () => {
    const root: ParsedType = {
      kind: 'array',
      itemType: { kind: 'number' },
    };
    const registry: TypeRegistry = new Map();
    const code = genTypeCode(root, registry, 'Numbers');

    expect(code).toBe('export type Numbers = number[];');
  });

  test('generates union type alias', () => {
    const root: ParsedType = {
      kind: 'union',
      types: [{ kind: 'string' }, { kind: 'number' }],
    };
    const registry: TypeRegistry = new Map();
    const code = genTypeCode(root, registry, 'StringOrNumber');

    expect(code).toBe('export type StringOrNumber = string | number;');
  });

  test('generates interface from registry', () => {
    const root: ParsedType = { kind: 'reference', name: 'User' };
    const registry: TypeRegistry = new Map([
      [
        'User',
        {
          kind: 'object',
          properties: [
            { key: 'name', type: { kind: 'string' }, optional: false },
            { key: 'age', type: { kind: 'number' }, optional: false },
          ],
        },
      ],
    ]);
    const code = genTypeCode(root, registry, 'User');

    expect(code).toContain('export interface User');
    expect(code).toContain('name: string');
    expect(code).toContain('age: number');
  });

  test('generates multiple interfaces', () => {
    const root: ParsedType = { kind: 'reference', name: 'Response' };
    const registry: TypeRegistry = new Map([
      [
        'User',
        {
          kind: 'object',
          properties: [{ key: 'name', type: { kind: 'string' }, optional: false }],
        },
      ],
      [
        'Response',
        {
          kind: 'object',
          properties: [{ key: 'user', type: { kind: 'reference', name: 'User' }, optional: false }],
        },
      ],
    ]);
    const code = genTypeCode(root, registry, 'Response');

    expect(code).toContain('export interface User');
    expect(code).toContain('export interface Response');
    expect(code).toContain('user: User');
  });

  test('handles optional properties', () => {
    const root: ParsedType = { kind: 'reference', name: 'User' };
    const registry: TypeRegistry = new Map([
      [
        'User',
        {
          kind: 'object',
          properties: [
            { key: 'name', type: { kind: 'string' }, optional: false },
            { key: 'age', type: { kind: 'number' }, optional: true },
          ],
        },
      ],
    ]);
    const code = genTypeCode(root, registry, 'User');

    expect(code).toContain('name: string');
    expect(code).toContain('age?: number');
  });

  test('quotes special property names', () => {
    const root: ParsedType = { kind: 'reference', name: 'Special' };
    const registry: TypeRegistry = new Map([
      [
        'Special',
        {
          kind: 'object',
          properties: [
            { key: 'user-name', type: { kind: 'string' }, optional: false },
            { key: '123', type: { kind: 'string' }, optional: false },
          ],
        },
      ],
    ]);
    const code = genTypeCode(root, registry, 'Special');

    expect(code).toContain('"user-name": string');
    expect(code).toContain('"123": string');
  });

  test('handles union array with parentheses', () => {
    const root: ParsedType = {
      kind: 'array',
      itemType: {
        kind: 'union',
        types: [{ kind: 'string' }, { kind: 'number' }],
      },
    };
    const registry: TypeRegistry = new Map();
    const code = genTypeCode(root, registry, 'Mixed');

    expect(code).toBe('export type Mixed = (string | number)[];');
  });
});
