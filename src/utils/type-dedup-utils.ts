import { type ParsedType, type ParsedProperty } from '@/types/parsed';

/**
 * Generate hash string for type deduplication
 * @param node - The parsed type node
 * @returns Hash string representing the type structure
 */
export function getTypeHash(node: ParsedType): string {
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
      return `[${getTypeHash(node.itemType)}]`;
    case 'union':
      return `(${node.types.map(getTypeHash).sort().join('|')})`;
    case 'object': {
      const propsWithOptional = node.properties
        .sort((a, b) => a.key.localeCompare(b.key))
        .map((p) => `${p.key}${p.optional ? '?' : ''}:${getTypeHash(p.type)}`)
        .join(',');
      return `{${propsWithOptional}}`;
    }
    default:
      return 'unknown';
  }
}

/**
 * Deduplicate an array of types based on their hash
 * @param types - Array of parsed types to deduplicate
 * @returns Array of unique types
 */
export function deduplicateTypes(types: ParsedType[]): ParsedType[] {
  const uniqueMap = new Map<string, ParsedType>();
  for (const type of types) {
    const hash = getTypeHash(type);
    if (!uniqueMap.has(hash)) uniqueMap.set(hash, type);
  }
  return Array.from(uniqueMap.values());
}

/**
 * Merge multiple object types into single type with optional properties
 * @param objectTypes - Array of object type nodes to merge
 * @returns Merged object type with optional properties marked
 */
export function mergeObjectTypes(
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

      let uniqueTypes = deduplicateTypes(types);

      // If all types are objects, merge them recursively
      const allObjects = uniqueTypes.every((t) => t.kind === 'object');
      if (allObjects && uniqueTypes.length > 1)
        uniqueTypes = [mergeObjectTypes(uniqueTypes as Array<ParsedType & { kind: 'object' }>)];
      // If all types are arrays, merge their item types if they're objects
      const allArrays = uniqueTypes.every((t) => t.kind === 'array');
      if (allArrays && uniqueTypes.length > 1) {
        const itemTypes = (uniqueTypes as Array<ParsedType & { kind: 'array' }>).map(
          (t) => t.itemType
        );
        const allItemsAreObjects = itemTypes.every((t) => t.kind === 'object');
        if (allItemsAreObjects) {
          const mergedItemType = mergeObjectTypes(
            itemTypes as Array<ParsedType & { kind: 'object' }>
          );
          uniqueTypes = [{ kind: 'array', itemType: mergedItemType }];
        }
      }

      // Filter out any[] if there are more specific array types
      const hasAnyArray = uniqueTypes.some((t) => t.kind === 'array' && t.itemType.kind === 'any');
      const hasSpecificArray = uniqueTypes.some(
        (t) => t.kind === 'array' && t.itemType.kind !== 'any'
      );
      if (hasAnyArray && hasSpecificArray)
        uniqueTypes = uniqueTypes.filter((t) => !(t.kind === 'array' && t.itemType.kind === 'any'));

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
