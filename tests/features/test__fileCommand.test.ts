import { describe, expect, test, afterAll } from 'bun:test';
import { fileCommand } from '@/commands/file';
import { join } from 'path';

const testDir = import.meta.dir;
const sampleJsonPath = join(testDir, 'sample.json');
const outputPath = join(testDir, 'output.ts');

describe('fileCommand', () => {
  afterAll(async () => {
    try {
      await Bun.write(outputPath, '');
      const file = Bun.file(outputPath);
      if (await file.exists()) {
        await Bun.$`rm ${outputPath}`;
      }
    } catch {}
  });

  test('reads and parses JSON file', async () => {
    await fileCommand(sampleJsonPath, {
      name: 'Product',
      output: outputPath,
    });

    const file = Bun.file(outputPath);
    expect(await file.exists()).toBe(true);

    const content = await file.text();
    expect(content).toContain('export interface Product');
    expect(content).toContain('export interface Category');
    expect(content).toContain('export interface Review');
    expect(content).toContain('export interface Metadata');
  });

  test('validates generated type structure', async () => {
    await fileCommand(sampleJsonPath, {
      name: 'TestProduct',
      output: outputPath,
    });

    const content = await Bun.file(outputPath).text();

    expect(content).toContain('id: number');
    expect(content).toContain('title: string');
    expect(content).toContain('price: number');
    expect(content).toContain('inStock: boolean');
    expect(content).toContain('tags: string[]');
    expect(content).toContain('category: Category');
    expect(content).toContain('reviews: Review[]');
    expect(content).toContain('metadata: Metadata');
  });

  test('handles nested objects correctly', async () => {
    await fileCommand(sampleJsonPath, {
      name: 'ApiResponse',
      output: outputPath,
    });

    const content = await Bun.file(outputPath).text();

    expect(content).toContain('export interface Category');
    expect(content).toContain('name: string');
    expect(content).toContain('slug: string');

    expect(content).toContain('export interface Review');
    expect(content).toContain('rating: number');
    expect(content).toContain('comment?: string');
    expect(content).toContain('verified: boolean');
  });

  test('handles arrays correctly', async () => {
    await fileCommand(sampleJsonPath, {
      name: 'Data',
      output: outputPath,
    });

    const content = await Bun.file(outputPath).text();

    expect(content).toContain('tags: string[]');
    expect(content).toContain('reviews: Review[]');
    expect(content).toContain('variants: Variant[]');
  });

  test('detects optional properties', async () => {
    await fileCommand(sampleJsonPath, {
      name: 'Product',
      output: outputPath,
    });

    const content = await Bun.file(outputPath).text();

    expect(content).toContain('export interface Review');
    expect(content).toContain('comment?: string');
    expect(content).toContain('export interface Variant');
    expect(content).toContain('stock?: number');
  });

  test('handles union types in arrays', async () => {
    await fileCommand(sampleJsonPath, {
      name: 'Product',
      output: outputPath,
    });

    const content = await Bun.file(outputPath).text();

    expect(content).toContain('relatedItems: (number | string)[]');
  });

  test('handles null type', async () => {
    await fileCommand(sampleJsonPath, {
      name: 'Product',
      output: outputPath,
    });

    const content = await Bun.file(outputPath).text();

    expect(content).toContain('discount: null');
  });
});
