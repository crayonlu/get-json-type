import { describe, expect, test } from 'bun:test';
import { genType } from '@/core/common/parser';

describe('genType', () => {
  test('null type', () => {
    const result = genType(null);
    expect(result).toEqual({ kind: 'null' });
  });

  test('primitive types', () => {
    expect(genType('hello')).toEqual({ kind: 'string' });
    expect(genType(123)).toEqual({ kind: 'number' });
    expect(genType(true)).toEqual({ kind: 'boolean' });
    expect(genType(false)).toEqual({ kind: 'boolean' });
  });

  test('empty array', () => {
    const result = genType([]);
    expect(result).toEqual({
      kind: 'array',
      itemType: { kind: 'any' },
    });
  });

  test('array with single type', () => {
    const result = genType([1, 2, 3]);
    expect(result).toEqual({
      kind: 'array',
      itemType: { kind: 'number' },
    });
  });

  test('array with mixed types (union)', () => {
    const result = genType([1, 'hello', true]);
    expect(result.kind).toBe('array');
    if (result.kind === 'array') expect(result.itemType.kind).toBe('union');
  });

  test('simple object', () => {
    const result = genType({ name: 'John', age: 30 });
    expect(result.kind).toBe('object');
    if (result.kind === 'object') {
      expect(result.properties).toHaveLength(2);
      expect(result.properties[0]).toEqual({
        key: 'age',
        type: { kind: 'number' },
        optional: false,
      });
    }
  });

  test('nested object', () => {
    const result = genType({
      user: {
        name: 'John',
        age: 30,
      },
    });
    expect(result.kind).toBe('object');
    if (result.kind === 'object') {
      expect(result.properties[0]?.key).toBe('user');
      expect(result.properties[0]?.type.kind).toBe('object');
    }
  });

  test('array of objects', () => {
    const result = genType([
      { name: 'John', age: 30 },
      { name: 'Jane', age: 25 },
    ]);
    expect(result.kind).toBe('array');
    if (result.kind === 'array') expect(result.itemType.kind).toBe('object');
  });

  test('object with special property names', () => {
    const result = genType({ 'user-name': 'John', '123': 'value' });
    expect(result.kind).toBe('object');
    if (result.kind === 'object') {
      expect(result.properties).toHaveLength(2);
      expect(result.properties[0]?.key).toBe('123');
      expect(result.properties[1]?.key).toBe('user-name');
    }
  });

  test('complex nested structure', () => {
    const result = genType({
      users: [
        { name: 'John', posts: [{ title: 'Hello', likes: 10 }] },
        { name: 'Jane', posts: [] },
      ],
      count: 2,
    });
    expect(result.kind).toBe('object');
    if (result.kind === 'object') expect(result.properties).toHaveLength(2);
  });
});
