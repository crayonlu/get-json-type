import { type ParsedType, type TypeRegistry } from '@/types/parsed';
import pluralize from 'pluralize';

export class TypeTransformer {
  private registry: TypeRegistry = new Map();
  private nameCounter: Map<string, number> = new Map();

  constructor(private rootName: string) {}

  /**
   * Transform AST by extracting nested objects to registry
   * @param ast - The parsed type AST to transform
   * @returns Transformed root type and registry of extracted types
   */
  public transform(ast: ParsedType): { root: ParsedType; registry: TypeRegistry } {
    this.registry.clear();
    this.nameCounter.clear();
    const newRoot = this.traverse(ast, this.rootName);
    return { root: newRoot, registry: this.registry };
  }

  /**
   * Recursively traverse AST and extract object types
   * @param node - Current AST node
   * @param suggestedName - Suggested name for extracted type
   * @returns Transformed type node
   */
  private traverse(node: ParsedType, suggestedName: string): ParsedType {
    if (node.kind === 'object') {
      const newProperties = node.properties.map((prop) => ({
        ...prop,
        type: this.traverse(prop.type, this.capitalize(prop.key)),
      }));

      const finalName = this.getUniqueName(suggestedName);

      this.registry.set(finalName, {
        ...node,
        properties: newProperties,
      });
      return { kind: 'reference', name: finalName };
    }
    if (node.kind === 'array') {
      const singularName = pluralize.singular(suggestedName);
      return {
        kind: 'array',
        itemType: this.traverse(node.itemType, singularName),
      };
    }
    if (node.kind === 'union') {
      return {
        kind: 'union',
        types: node.types.map((t, index) => this.traverse(t, `${suggestedName}Union${index}`)),
      };
    }
    return node;
  }

  /**
   * Generate unique type name by appending counter
   * @param name - Base type name
   * @returns Unique type name
   */
  private getUniqueName(name: string): string {
    const count = this.nameCounter.get(name) || 0;
    this.nameCounter.set(name, count + 1);
    return count === 0 ? name : `${name}${count}`;
  }

  /**
   * Capitalize string and remove special characters
   * @param s - Input string
   * @returns Capitalized string safe for type names
   */
  private capitalize(s: string) {
    if (!s) return '';
    const safeS = s.replace(/[^a-zA-Z0-9]/g, '');
    return safeS.charAt(0).toUpperCase() + safeS.slice(1);
  }
}
