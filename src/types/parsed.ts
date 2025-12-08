/**
 * Parsed TypeScript type representation
 */
export type ParsedType =
  | { kind: 'string' }
  | { kind: 'number' }
  | { kind: 'boolean' }
  | { kind: 'null' }
  | { kind: 'any' }
  | { kind: 'array'; itemType: ParsedType }
  | { kind: 'object'; properties: ParsedProperty[] }
  | { kind: 'union'; types: ParsedType[] }
  | { kind: 'reference'; name: string };
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
/**
 * Type registry for named types
 */
export type TypeRegistry = Map<string, ParsedType>;
