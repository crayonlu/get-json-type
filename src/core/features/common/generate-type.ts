import parseJsonToType from '@/core/common';
import type { JsonValue } from '@/types/json';
import { writeFile } from 'fs/promises';

export interface GenerateTypeOptions {
  typeName: string;
  outputPath?: string;
}

export interface GenerateTypeResult {
  code: string;
  saved: boolean;
  outputPath?: string;
}

export async function generateTypeFromJson(
  jsonData: JsonValue,
  options: GenerateTypeOptions
): Promise<GenerateTypeResult> {
  const parseResult = parseJsonToType(jsonData, options.typeName);

  if (options.outputPath) {
    await writeFile(options.outputPath, parseResult.code, 'utf-8');
    return {
      code: parseResult.code,
      saved: true,
      outputPath: options.outputPath,
    };
  }

  return {
    code: parseResult.code,
    saved: false,
  };
}
