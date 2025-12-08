import { describe, expect, test } from 'bun:test';
import parseJsonToType from '@/core/common';

describe('parseJsonToType', () => {
  test('simple object generates interface', () => {
    const result = parseJsonToType({ name: 'John', age: 30 }, 'User');
    expect(result.typeName).toBe('User');
    expect(result.code).toContain('export interface User');
    expect(result.code).toContain('name: string');
    expect(result.code).toContain('age: number');
  });

  test('primitive types generate type alias', () => {
    const result = parseJsonToType('hello', 'MyString');
    expect(result.code).toBe('export type MyString = string;');
  });

  test('array of primitives generates type alias', () => {
    const result = parseJsonToType([1, 2, 3], 'Numbers');
    expect(result.code).toBe('export type Numbers = number[];');
  });

  test('nested objects are extracted as separate interfaces', () => {
    const data = {
      user: {
        name: 'John',
        age: 30,
      },
      active: true,
    };
    const result = parseJsonToType(data, 'Response');
    expect(result.code).toContain('export interface User');
    expect(result.code).toContain('export interface Response');
    expect(result.code).toContain('user: User');
  });

  test('array of objects extracts interface', () => {
    const data = {
      users: [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ],
    };
    const result = parseJsonToType(data, 'ApiResponse');
    expect(result.code).toContain('export interface User');
    expect(result.code).toContain('users: User[]');
  });

  test('mixed type array generates union', () => {
    const result = parseJsonToType([1, 'hello', true], 'Mixed');
    expect(result.code).toContain('number | string | boolean');
  });

  test('special property names are quoted', () => {
    const data = { 'user-name': 'John', '123': 'value' };
    const result = parseJsonToType(data, 'Special');
    expect(result.code).toContain('"user-name"');
    expect(result.code).toContain('"123"');
  });

  test('deeply nested structure', () => {
    const data = {
      users: [
        {
          name: 'John',
          posts: [
            { title: 'Hello', likes: 10 },
            { title: 'World', likes: 20 },
          ],
        },
      ],
    };
    const result = parseJsonToType(data, 'Blog');
    expect(result.code).toContain('export interface Post');
    expect(result.code).toContain('export interface User');
    expect(result.code).toContain('export interface Blog');
  });

  test('empty array defaults to any[]', () => {
    const result = parseJsonToType({ items: [] }, 'Container');
    expect(result.code).toContain('items: any[]');
  });

  test('null type', () => {
    const result = parseJsonToType({ value: null }, 'NullTest');
    expect(result.code).toContain('value: null');
  });

  test('complex real-world example', () => {
    const data = {
      id: 1,
      name: 'Product',
      price: 99.99,
      inStock: true,
      tags: ['electronics', 'sale'],
      metadata: {
        createdAt: '2025-12-08',
        updatedAt: '2025-12-08',
      },
      reviews: [
        { rating: 5, comment: 'Great!' },
        { rating: 4, comment: 'Good' },
      ],
    };
    const result = parseJsonToType(data, 'Product');
    expect(result.code).toContain('export interface Metadata');
    expect(result.code).toContain('export interface Review');
    expect(result.code).toContain('export interface Product');
    expect(result.code).toContain('tags: string[]');
    expect(result.code).toContain('reviews: Review[]');
  });
});
