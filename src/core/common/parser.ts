import { type JsonValue } from '@/types/json';
import { type ParsedType, type ParsedProperty } from '@/types/parsed';

/**
 * Generate hash string for type deduplication
 * @param node - The parsed type node
 * @returns Hash string representing the type structure
 */
export function getTempHash(node: ParsedType): string {
  switch (node.kind) {
    case 'string':
      return 's';
    case 'number':
      return 'n';
    case 'boolean':
      return 'b';
    case 'null':
      return 'null';
    case 'any':
      return 'any';
    case 'reference':
      return `ref:${node.name}`;
    case 'array':
      return `[${getTempHash(node.itemType)}]`;
    case 'union':
      return `(${node.types.map(getTempHash).sort().join('|')})`;
    case 'object': {
      const keys = node.properties
        .map((p) => p.key)
        .sort()
        .join(',');
      const values = node.properties
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((p) => getTempHash(p.type))
        .join(',');
      return `{${keys}:${values}}`;
    }
    default:
      return 'unknown';
  }
}

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

    const uniqueMap = new Map<string, ParsedType>();
    for (const item of allItemTypes) {
      const hash = getTempHash(item);
      if (!uniqueMap.has(hash)) {
        uniqueMap.set(hash, item);
      }
    }
    const uniqueTypes = Array.from(uniqueMap.values());

    if (uniqueTypes.length === 1) {
      return { kind: 'array', itemType: uniqueTypes[0]! };
    }

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

/**
 * Merge multiple object types into single type with optional properties
 * @param objectTypes - Array of object type nodes to merge
 * @returns Merged object type with optional properties marked
 */
function mergeObjectTypes(
  objectTypes: Array<ParsedType & { kind: 'object' }>
): ParsedType & { kind: 'object' } {
  const allKeys = new Set<string>();
  const propertyTypesByKey = new Map<string, ParsedType[]>();

  for (const obj of objectTypes) {
    for (const prop of obj.properties) {
      allKeys.add(prop.key);
      if (!propertyTypesByKey.has(prop.key)) propertyTypesByKey.set(prop.key, []);
      propertyTypesByKey.get(prop.key)!.push(prop.type);
    }
  }

  const mergedProperties: ParsedProperty[] = Array.from(allKeys)
    .sort()
    .map((key) => {
      const types = propertyTypesByKey.get(key)!;
      const appearCount = types.length;
      const totalObjects = objectTypes.length;
      const optional = appearCount < totalObjects;

      const uniqueTypeMap = new Map<string, ParsedType>();
      for (const type of types) {
        const hash = getTempHash(type);
        if (!uniqueTypeMap.has(hash)) uniqueTypeMap.set(hash, type);
      }
      const uniqueTypes = Array.from(uniqueTypeMap.values());

      const mergedType: ParsedType =
        uniqueTypes.length === 1 ? uniqueTypes[0]! : { kind: 'union', types: uniqueTypes };

      return {
        key,
        type: mergedType,
        optional,
      };
    });

  return {
    kind: 'object',
    properties: mergedProperties,
  };
}
