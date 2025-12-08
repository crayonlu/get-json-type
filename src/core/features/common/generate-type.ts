import parseJsonToType from '@/core/common';
import type { JsonValue } from '@/types/json';

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
    await Bun.write(options.outputPath, parseResult.code);
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
