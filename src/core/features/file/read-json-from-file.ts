import path from 'path';
import type { JsonValue } from '@/types/json';

export async function readJsonFromFile(filePath: string): Promise<JsonValue> {
  const absolutePath = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);

  const fileContent = await Bun.file(absolutePath).text();
  try {
    return JSON.parse(fileContent);
  } catch (error) {
    throw new Error('Failed to parse JSON from file content' + ': ' + (error as Error).message);
  }
}
