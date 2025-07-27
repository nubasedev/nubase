// src/converters/toZod.ts

import { z } from "zod";
import {
  ArraySchema,
  BooleanSchema,
  type NuSchema, // The union type of all nu schemas
  NumberSchema,
  type ObjectOutput, // Type utility to get object output type
  ObjectSchema,
  OptionalSchema,
  PartialObjectSchema,
  StringSchema,
} from "./schema";

/**
 * Infers the Zod schema type corresponding to a given NuSchema type.
 * This is a conditional type that maps NuSchema types to their Zod equivalents
 * and preserves the output type.
 */
export type NuSchemaToZodSchema<S extends NuSchema> = S extends StringSchema
  ? z.ZodString
  : S extends NumberSchema
    ? z.ZodNumber
    : S extends BooleanSchema
      ? z.ZodBoolean
      : S extends OptionalSchema<infer TWrapped>
        ? z.ZodOptional<NuSchemaToZodSchema<TWrapped & NuSchema>>
        : S extends ObjectSchema<infer TShape>
          ? z.ZodObject<
              {
                [K in keyof TShape]: NuSchemaToZodSchema<TShape[K] & NuSchema>;
              },
              any,
              z.ZodTypeAny,
              ObjectOutput<TShape>
            >
          : S extends PartialObjectSchema<infer TShape>
            ? z.ZodObject<
                {
                  [K in keyof TShape]: z.ZodOptional<
                    NuSchemaToZodSchema<TShape[K] & NuSchema>
                  >;
                },
                any,
                z.ZodTypeAny,
                Partial<ObjectOutput<TShape>>
              >
            : // Recursive mapping for object shape
              S extends ArraySchema<infer TElementSchema>
              ? z.ZodArray<NuSchemaToZodSchema<TElementSchema & NuSchema>>
              : // Recursive mapping for array element
                z.ZodSchema<any>; // Fallback for unknown types

/**
 * Converts a nubase schema to a Zod schema.
 * Preserves the TypeScript output type.
 * Metadata (label, description etc.) is NOT translated to Zod schema properties
 * as Zod doesn't have direct equivalents in its core schema structure.
 * It only translates the validation structure and output type.
 *
 * @param schema The nubase schema to convert.
 * @returns The equivalent Zod schema.
 */
export function toZod<S extends NuSchema>(schema: S): NuSchemaToZodSchema<S> {
  if (schema instanceof StringSchema) {
    // Add Zod string validations based on schema._meta or specific properties if they exist
    // e.g., if (schema._meta.minLength) zodSchema = zodSchema.min(schema._meta.minLength);
    // For now, just the base type:
    return z.string() as NuSchemaToZodSchema<S>;
  }

  if (schema instanceof NumberSchema) {
    // Add Zod number validations similarly
    return z.number() as NuSchemaToZodSchema<S>;
  }

  if (schema instanceof BooleanSchema) {
    return z.boolean() as NuSchemaToZodSchema<S>;
  }

  if (schema instanceof OptionalSchema) {
    // Recursively convert the wrapped schema and make it optional
    const wrappedZodSchema = toZod(schema._wrapped as NuSchema);
    return wrappedZodSchema.optional() as NuSchemaToZodSchema<S>;
  }

  if (schema instanceof ObjectSchema) {
    const zodShape: Record<string, z.ZodTypeAny> = {};
    // Recursively convert each schema in the shape
    for (const key in schema._shape) {
      if (Object.prototype.hasOwnProperty.call(schema._shape, key)) {
        zodShape[key] = toZod(schema._shape[key] as NuSchema); // Recursive call
      }
    }
    // Zod object constructor needs the shape object
    return z.object(zodShape) as NuSchemaToZodSchema<S>;
  }

  if (schema instanceof PartialObjectSchema) {
    const zodShape: Record<string, z.ZodTypeAny> = {};
    // Recursively convert each schema in the shape and make them optional
    for (const key in schema._shape) {
      if (Object.prototype.hasOwnProperty.call(schema._shape, key)) {
        zodShape[key] = toZod(schema._shape[key] as NuSchema).optional(); // Make optional
      }
    }
    // Zod object constructor needs the shape object
    return z.object(zodShape) as NuSchemaToZodSchema<S>;
  }

  if (schema instanceof ArraySchema) {
    // Recursively convert the element schema
    const zodElementSchema = toZod(schema._element as NuSchema);
    // Zod array constructor needs the element schema
    return z.array(zodElementSchema) as NuSchemaToZodSchema<S>;
  }

  // Handle other schema types here...
  // For now, throw an error for unsupported types
  throw new Error(
    `Unsupported schema type for Zod conversion: ${(schema as any).constructor.name}`,
  );
}
