import { type JsonValue } from '@/types/json';
/**
 * fetch JSON from a URL with optional Bearer authorization
 * @param url string
 * @param bearer string | undefined
 * @returns JsonValue
 * @author crayon
 * @date 2025-12-7
 */
export default async function getJsonFromUrl(url: string, bearer?: string): Promise<JsonValue> {
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (bearer) headers['Authorization'] = `Bearer ${bearer}`;
  const response = await fetch(url, { headers });
  if (!response.ok)
    throw new Error(`Failed to fetch JSON from URL: ${response.status} ${response.statusText}`);
  // safe json parse
  try {
    const data = await response.json();
    return data as JsonValue;
  } catch (error) {
    throw new Error(`Failed to parse JSON from URL: ${error}`);
  }
}
