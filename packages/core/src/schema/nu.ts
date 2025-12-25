import {
  ArraySchema,
  type BaseSchema,
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  type ObjectShape,
  RecordSchema,
  StringSchema,
} from "./schema";

/**
 * The main nubase schema instance.
 * Provides factory methods to create different schema types.
 */
export const nu = {
  boolean: () => new BooleanSchema(),
  /**
   * Creates a string schema.
   */
  string: () => new StringSchema(),

  /**
   * Creates a number schema.
   */
  number: () => new NumberSchema(),

  /**
   * Creates an object schema with a defined shape.
   * @param shape An object mapping keys to schemas.
   */
  object: <TShape extends ObjectShape>(shape: TShape) =>
    new ObjectSchema(shape),

  /**
   * Creates an array schema with a defined element schema.
   * @param elementSchema The schema for elements within the array.
   */
  array: <TElementSchema extends BaseSchema<any>>(
    elementSchema: TElementSchema,
  ) => new ArraySchema(elementSchema),

  /**
   * Creates a record schema (dictionary) with string keys and values of a specific type.
   * Similar to TypeScript's Record<string, T>.
   *
   * @example
   * const scoresSchema = nu.record(nu.number());
   * // Represents: { [key: string]: number }
   *
   * @param valueSchema The schema for values in the record.
   */
  record: <TValueSchema extends BaseSchema<any>>(valueSchema: TValueSchema) =>
    new RecordSchema(valueSchema),
};
