/**
 * Core library exports for browser and Node.js environments
 * This file excludes CLI-specific dependencies to ensure browser compatibility
 */

// Core type conversion functionality
export { default as parseJsonToType } from '@/core/common';

// Library functions
export { generateTypeFromJson } from '@/core/features/common/generate-type';

// Type definitions
export type { GenerateTypeOptions, GenerateTypeResult } from '@/core/features/common/generate-type';
export type { JsonValue, JsonObject, JsonArray, JsonPrimitive } from '@/types/json';
export type { ParsedType, ParsedProperty, ParseResult } from '@/types/parsed';
