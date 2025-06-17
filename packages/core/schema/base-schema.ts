// src/schema/BaseSchema.ts

import { z } from 'zod'; // We'll need Zod later for toZod conversion

// Define metadata types
export interface SchemaMetadata<Output = any> {
  label?: string;
  description?: string;
  defaultValue?: Output;
}

// Base schema class
export abstract class BaseSchema<Output = any> {
  /**
   * Phantom property used for TypeScript type inference.
   * Does not exist at runtime.
   * @internal
   */
  readonly _outputType!: Output;

  _meta: SchemaMetadata<Output> = {};

  /**
   * Replace the schema metadata with a new object.
   * @param meta The new metadata object.
   * @returns The schema instance for chaining.
   */
  meta(meta: SchemaMetadata<Output>): this {
    this._meta = meta;
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