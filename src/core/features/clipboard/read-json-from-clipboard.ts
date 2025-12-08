import clipboardy from 'clipboardy';
import type { JsonValue } from '@/types/json';

export async function readJsonFromClipboard(): Promise<JsonValue> {
  const clipboardContent = await clipboardy.read();
  try {
    return JSON.parse(clipboardContent);
  } catch (error) {
    throw new Error(
      'Failed to parse JSON from clipboard content' + ': ' + (error as Error).message
    );
  }
}
