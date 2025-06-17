// src/schema/types.ts

import { BaseSchema, ComputedSchemaMetadata } from './base-schema';

// --- Primitive Schemas ---

export class BooleanSchema extends BaseSchema<boolean> {
  parse(data: any): boolean {
    if (typeof data !== 'boolean') {
      throw new Error(`Expected boolean, received ${typeof data}`);
    }
    return data;
  }
}

export class StringSchema extends BaseSchema<string> {
  parse(data: any): string {
    if (typeof data !== 'string') {
      throw new Error(`Expected string, received ${typeof data}`);
    }
    return data;
  }
  // Add string-specific validation methods here (e.g., minLength, pattern)
}

export class NumberSchema extends BaseSchema<number> {
  parse(data: any): number {
    if (typeof data !== 'number' || !Number.isFinite(data)) {
      throw new Error(`Expected number, received ${typeof data}`);
    }
    return data;
  }
  // Add number-specific validation methods here (e.g., min, max)
}

// Add more primitives like BooleanSchema, NullableSchema, OptionalSchema etc.

// --- Complex Schemas ---

/**
 * Type representing the shape of an object schema (key to schema mapping).
 */
export type ObjectShape = {
  [key: string]: BaseSchema<any>;
};

/**
 * Infers the TypeScript output type from an ObjectShape.
 * Use mapped types to get the output type of each property schema.
 */
export type ObjectOutput<TShape extends ObjectShape> = {
  [K in keyof TShape]: TShape[K]['_outputType'];
};

/**
 * Type representing computed metadata for object properties.
 */
export type ObjectComputedMetadata<TShape extends ObjectShape> = {
  [K in keyof TShape]?: Partial<ComputedSchemaMetadata<TShape[K]['_outputType'], ObjectOutput<TShape>>>;
};

export class ObjectSchema<TShape extends ObjectShape> extends BaseSchema<ObjectOutput<TShape>> {
  _shape: TShape;
  _computedMeta: ObjectComputedMetadata<TShape> = {};

  constructor(shape: TShape) {
    super();
    this._shape = shape;
  }

  /**
   * Add computed metadata to the object schema.
   * @param computedMeta Object mapping property keys to computed metadata functions.
   * @returns The schema instance for chaining.
   */
  withComputed(computedMeta: ObjectComputedMetadata<TShape>): this {
    this._computedMeta = computedMeta;
    return this;
  }

  /**
   * Get the computed metadata for a specific property.
   * @param key The property key.
   * @param data The parsed object data to pass to computed functions.
   * @returns Promise resolving to the computed metadata.
   */
  async getComputedMeta(key: keyof TShape, data: ObjectOutput<TShape>): Promise<Partial<import('./base-schema').SchemaMetadata<TShape[typeof key]['_outputType']>>> {
    const computedMeta = this._computedMeta[key];
    if (!computedMeta) {
      return {};
    }

    const result: any = {};
    
    if (computedMeta.label) {
      result.label = await computedMeta.label(data);
    }
    
    if (computedMeta.description) {
      result.description = await computedMeta.description(data);
    }
    
    if (computedMeta.defaultValue) {
      result.defaultValue = await computedMeta.defaultValue(data);
    }

    return result;
  }

  /**
   * Get all computed metadata for all properties.
   * @param data The parsed object data to pass to computed functions.
   * @returns Promise resolving to a map of property keys to computed metadata.
   */
  async getAllComputedMeta(data: ObjectOutput<TShape>): Promise<Record<keyof TShape, Partial<import('./base-schema').SchemaMetadata<any>>>> {
    const result: any = {};
    
    for (const key in this._shape) {
      result[key] = await this.getComputedMeta(key, data);
    }
    
    return result;
  }

  parse(data: any): ObjectOutput<TShape> {
    if (typeof data !== 'object' || data === null) {
      throw new Error(`Expected object, received ${typeof data}`);
    }

    const result: any = {};
    const errors: string[] = [];

    // Validate defined properties
    for (const key in this._shape) {
      if (Object.prototype.hasOwnProperty.call(this._shape, key)) {
        const schema = this._shape[key];
        const value = (data as any)[key]; // Get value from input data
        try {
          if (schema) {
            result[key] = schema.parse(value); // Recursively parse property
          }
        } catch (e: any) {
          errors.push(`Property "${key}": ${e.message}`);
        }
      }
    }

    // Basic handling for extra keys (can be made configurable)
    for (const key in data) {
        if (Object.prototype.hasOwnProperty.call(data, key) && !Object.prototype.hasOwnProperty.call(this._shape, key)) {
            // For now, ignore extra keys. Could throw an error or strip them.
            // errors.push(`Unknown property "${key}"`);
            // console.warn(`Warning: Unknown property "${key}" in object data.`);
        }
    }


    if (errors.length > 0) {
      throw new Error(`Object validation failed:\n${errors.join('\n')}`);
    }

    return result as ObjectOutput<TShape>;
  }
}

/**
 * Infers the TypeScript output type from an element schema for an array.
 */
export type ArrayOutput<TElementSchema extends BaseSchema<any>> = Array<TElementSchema['_outputType']>;


export class ArraySchema<TElementSchema extends BaseSchema<any>> extends BaseSchema<ArrayOutput<TElementSchema>> {
  _element: TElementSchema;

  constructor(elementSchema: TElementSchema) {
    super();
    this._element = elementSchema;
  }

  parse(data: any): ArrayOutput<TElementSchema> {
    if (!Array.isArray(data)) {
      throw new Error(`Expected array, received ${typeof data}`);
    }

    const result: any[] = [];
    const errors: string[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        result[i] = this._element.parse(data[i]); // Recursively parse each element
      } catch (e: any) {
        errors.push(`Element at index ${i}: ${e.message}`);
      }
    }

    if (errors.length > 0) {
        throw new Error(`Array validation failed:\n${errors.join('\n')}`);
    }

    return result as ArrayOutput<TElementSchema>;
  }
}

// Refine NuSchema union after defining concrete types
export type NuSchema =
  | BooleanSchema
  | StringSchema
  | NumberSchema
  // Add others like BooleanSchema
  | ObjectSchema<any>
  | ArraySchema<any>;