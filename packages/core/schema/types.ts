// src/schema/types.ts

import { BaseSchema } from './base-schema';

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

export class ObjectSchema<TShape extends ObjectShape> extends BaseSchema<ObjectOutput<TShape>> {
  _shape: TShape;

  constructor(shape: TShape) {
    super();
    this._shape = shape;
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
          result[key] = schema.parse(value); // Recursively parse property
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