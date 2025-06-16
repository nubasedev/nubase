// src/schema/BaseSchema.ts

import { z } from 'zod'; // We'll need Zod later for toZod conversion

// Define metadata types
export interface SchemaMetadata {
  label?: string;
  description?: string;
  [key: string]: any; // Allow arbitrary UI or other metadata
}

// Base schema class
export abstract class BaseSchema<Output = any> {
  /**
   * Phantom property used for TypeScript type inference.
   * Does not exist at runtime.
   * @internal
   */
  readonly _outputType!: Output;

  _meta: SchemaMetadata = {};

  /**
   * Add a label to the schema.
   * @param label The label text.
   * @returns The schema instance for chaining.
   */
  label(label: string): this {
    this._meta.label = label;
    return this;
  }

  /**
   * Add a description to the schema.
   * @param description The description text.
   * @returns The schema instance for chaining.
   */
  description(description: string): this {
    this._meta.description = description;
    return this;
  }

  /**
   * Add arbitrary metadata to the schema.
   * @param key The metadata key.
   * @param value The metadata value.
   * @returns The schema instance for chaining.
   */
  metadata(key: string, value: any): this {
    this._meta[key] = value;
    return this;
  }

  /**
   * Parses and validates the input data against the schema.
   * Should throw an error if validation fails.
   * @param data The data to parse.
   * @returns The parsed data (potentially transformed).
   */
  abstract parse(data: any): Output;

  // We could also add a safeParse method like Zod if needed
  // safeParse(data: any): { success: true; data: Output } | { success: false; error: SchemaError };
}

// Define a union type of all concrete schema types for easier handling
export type NuSchema = BaseSchema<any>; // This will be refined later