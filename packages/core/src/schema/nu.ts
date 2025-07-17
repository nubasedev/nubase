import {
  ArraySchema,
  type BaseSchema,
  BooleanSchema,
  NumberSchema,
  ObjectSchema,
  type ObjectShape,
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

  // Add more factory methods here (boolean, union, literal, etc.)
};
