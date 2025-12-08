import { type JsonValue } from '@/types/json';
import { type ParseResult } from '@/types/parsed';
import { genType } from './parser';
import { TypeTransformer } from './transformer';
import { genTypeCode } from './emitter';

/**
 * Parse JSON data to TypeScript type definitions
 * @param data - JSON data to parse
 * @param name - Name for the root type
 * @returns Parse result with generated TypeScript code
 */
export default function parseJsonToType(data: JsonValue, name: string): ParseResult {
  const rawAst = genType(data);

  const transformer = new TypeTransformer(name);
  const { root, registry } = transformer.transform(rawAst);

  const code = genTypeCode(root, registry, name);

  return {
    rootType: root,
    code,
    typeName: name,
  };
}
