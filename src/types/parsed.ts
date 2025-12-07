/**
 * Prased TypeScript type representation
 */
export type ParsedType =
  | { kind: 'string'; tsType: 'string' }
  | { kind: 'number'; tsType: 'number' }
  | { kind: 'boolean'; tsType: 'boolean' }
  | { kind: 'null'; tsType: 'null' }
  | { kind: 'array'; tsType: string; itemType: ParsedType }
  | { kind: 'object'; tsType: string; properties: ParsedProperty[] }
  | { kind: 'union'; tsType: string; types: ParsedType[] };
/**
 * Object's property
 */
export interface ParsedProperty {
  key: string;
  type: ParsedType;
  optional: boolean;
}

/**
 * The complete parse result
 */
export interface ParseResult {
  /** Root type */
  rootType: ParsedType;
  /** Generated TypeScript code */
  code: string;
  /** Type name (if it is a top-level type) */
  typeName: string;
}
