import { type JsonValue } from '@/types/json';
import { type ParsedType, type ParsedProperty } from '@/types/parsed';
import { deduplicateTypes, mergeObjectTypes } from '@/utils/type-dedup-utils';

/**
 * Parse JSON value to AST type representation
 * @param data - The JSON value to parse
 * @returns Parsed type AST node
 */
export function genType(data: JsonValue): ParsedType {
  if (data === undefined) return { kind: 'any' };
  if (data === null) return { kind: 'null' };

  if (Array.isArray(data)) {
    if (data.length === 0) return { kind: 'array', itemType: { kind: 'any' } };

    const allItemTypes = data.map((item) => genType(item));
    const uniqueTypes = deduplicateTypes(allItemTypes);

    if (uniqueTypes.length === 1) return { kind: 'array', itemType: uniqueTypes[0]! };

    const allObjects = uniqueTypes.every((t) => t.kind === 'object');

    if (allObjects) {
      const mergedObject = mergeObjectTypes(uniqueTypes as Array<ParsedType & { kind: 'object' }>);
      return { kind: 'array', itemType: mergedObject };
    }

    return {
      kind: 'array',
      itemType: {
        kind: 'union',
        types: uniqueTypes,
      },
    };
  }
  const typeName = typeof data;
  switch (typeName) {
    case 'string':
      return { kind: 'string' };
    case 'number':
      return { kind: 'number' };
    case 'boolean':
      return { kind: 'boolean' };
    case 'object': {
      const obj = data as { [key: string]: JsonValue };
      const sortedKeys = Object.keys(obj).sort();
      const properties: ParsedProperty[] = sortedKeys.map((key) => {
        const value = obj[key]!;
        return {
          key,
          type: genType(value),
          optional: false,
        };
      });
      return { kind: 'object', properties };
    }
    default:
      return { kind: 'any' };
  }
}
