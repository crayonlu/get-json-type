import { type ParsedType, type TypeRegistry, type ParsedProperty } from '@/types/parsed';
import { isSafeIdentifier } from '@/utils/regex-utils';
/**
 * Generate TypeScript code from AST and registry
 * @param root - Root type node
 * @param registry - Registry of extracted types
 * @param rootName - Name for the root type
 * @returns Generated TypeScript code string
 */
export function genTypeCode(root: ParsedType, registry: TypeRegistry, rootName: string): string {
  const codeLines: string[] = [];

  for (const [name, type] of registry) {
    if (type.kind === 'object') {
      const props = type.properties.map((p) => printProperty(p)).join('\n');
      codeLines.push(`export interface ${name} {\n${props}\n}`);
    }
  }

  if (root.kind === 'reference') return codeLines.join('\n\n');

  codeLines.push(`export type ${rootName} = ${printType(root)};`);
  return codeLines.join('\n\n');
}

/**
 * Format property as TypeScript interface property
 * @param prop - The property to format
 * @returns Formatted property string
 */
function printProperty(prop: ParsedProperty): string {
  const safeIdentifier = isSafeIdentifier(prop.key);
  const safeKey = safeIdentifier ? prop.key : `"${prop.key}"`;
  return `  ${safeKey}${prop.optional ? '?' : ''}: ${printType(prop.type)};`;
}

/**
 * Convert type node to TypeScript type string
 * @param node - The type node to convert
 * @returns TypeScript type string
 */
function printType(node: ParsedType): string {
  switch (node.kind) {
    case 'string':
      return 'string';
    case 'number':
      return 'number';
    case 'boolean':
      return 'boolean';
    case 'null':
      return 'null';
    case 'any':
      return 'any';
    case 'reference':
      return node.name;
    case 'array': {
      const itemStr = printType(node.itemType);
      const needsParens = node.itemType.kind === 'union';
      return needsParens ? `(${itemStr})[]` : `${itemStr}[]`;
    }
    case 'union':
      return node.types.map(printType).join(' | ');
    case 'object': {
      const props = node.properties
        .map((p) => `${p.key}${p.optional ? '?' : ''}: ${printType(p.type)}`)
        .join('; ');
      return `{ ${props} }`;
    }
    default:
      return 'any';
  }
}
