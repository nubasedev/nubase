import { z } from "zod";

// Define metadata types
export interface SchemaMetadata<Output = any> {
  label?: string;
  description?: string;
  defaultValue?: Output;
  /**
   * Custom renderer identifier to override the default type-based rendering.
   * Examples: "multiline", "email", "password", "url"
   */
  renderer?: string;
  validateOnSubmit?: (value: any) => string | undefined;
  validateOnSubmitAsync?: (value: any) => Promise<string | undefined>;
  validateOnBlur?: (value: any) => string | undefined;
  validateOnBlurAsync?: (value: any) => Promise<string | undefined>;
}

// ComputedSchemaMetadata should have the same properties as SchemaMetadata but
// the values should be functions that return the same types, but Promises.
export type ComputedSchemaMetadata<Output = any, Input = any> = {
  [K in keyof SchemaMetadata<Output>]: (
    input: Input,
  ) => Promise<SchemaMetadata<Output>[K]>;
};

export abstract class BaseSchema<Output = any> {
  /**
   * Phantom property used for TypeScript type inference.
   * Does not exist at runtime.
   * @internal
   */
  readonly _outputType!: Output;

  /**
   * The type identifier for this schema.
   * Used for type-based form field rendering.
   */
  abstract readonly type: string;

  _meta: SchemaMetadata<Output> = {};

  /**
   * Replace the schema metadata with a new object.
   * @param meta The new metadata object.
   * @returns The schema instance for chaining.
   */
  withMeta(meta: SchemaMetadata<Output>): this {
    this._meta = meta;
    return this;
  }

  /**
   * Add metadata with validation functions to the schema.
   * @param meta The metadata object with validation functions.
   * @returns The schema instance for chaining.
   */
  withMetadata(meta: SchemaMetadata<Output>): this {
    this._meta = { ...this._meta, ...meta };
    return this;
  }

  /**
   * Makes this schema optional, allowing undefined values.
   * @returns An OptionalSchema wrapping this schema.
   */
  optional(): OptionalSchema<this> {
    return new OptionalSchema(this);
  }

  /**
   * Converts this nubase schema to a Zod schema.
   * @returns The equivalent Zod schema.
   */
  abstract toZod(): z.ZodSchema<Output>;
}

// --- Primitive Schemas ---

export class BooleanSchema extends BaseSchema<boolean> {
  readonly type = "boolean" as const;

  toZod(): z.ZodBoolean {
    return z.boolean();
  }
}

export class StringSchema extends BaseSchema<string> {
  readonly type = "string" as const;
  // Add string-specific validation methods here (e.g., minLength, pattern)

  toZod(): z.ZodString {
    return z.string();
  }
}

export class NumberSchema extends BaseSchema<number> {
  readonly type = "number" as const;
  // Add number-specific validation methods here (e.g., min, max)

  toZod(): z.ZodNumber {
    return z.number();
  }
}

// --- Optional Schema ---

/**
 * A wrapper schema that makes the wrapped schema optional.
 * Allows undefined values in addition to the wrapped schema's type.
 */
export class OptionalSchema<
  TWrapped extends BaseSchema<any>,
> extends BaseSchema<TWrapped["_outputType"] | undefined> {
  readonly type = "optional" as const;
  _wrapped: TWrapped;

  constructor(wrapped: TWrapped) {
    super();
    this._wrapped = wrapped;
  }

  /**
   * Get the underlying wrapped schema.
   * @returns The wrapped schema.
   */
  unwrap(): TWrapped {
    return this._wrapped;
  }

  toZod(): z.ZodOptional<z.ZodNullable<z.ZodSchema<TWrapped["_outputType"]>>> {
    return this._wrapped.toZod().nullable().optional();
  }
}

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
 * Required keys are those that are not OptionalSchema instances.
 * Optional keys are those that are OptionalSchema instances.
 */
export type ObjectOutput<TShape extends ObjectShape> = {
  [K in keyof TShape as TShape[K] extends OptionalSchema<any>
    ? never
    : K]: TShape[K]["_outputType"];
} & {
  [K in keyof TShape as TShape[K] extends OptionalSchema<any>
    ? K
    : never]?: TShape[K]["_outputType"];
};

/**
 * Type representing computed metadata for object properties.
 */
export type ObjectComputedMetadata<TShape extends ObjectShape> = {
  [K in keyof TShape]?: Partial<
    ComputedSchemaMetadata<TShape[K]["_outputType"], ObjectOutput<TShape>>
  >;
};

// --- Layout Types ---

/**
 * Represents a field within a layout group.
 */
export interface FormLayoutField<TShape extends ObjectShape> {
  /** The name of the field - must be a valid property key from the object shape */
  name: keyof TShape;
  /** Width of the field in grid units (1-12) - number of 1/12 spaces it occupies */
  fieldWidth?: number;
  /** Additional CSS classes for styling */
  className?: string;
  /** Whether the field should be hidden */
  hidden?: boolean;
}

/**
 * Represents a group of fields within a layout.
 */
export interface LayoutGroup<TShape extends ObjectShape> {
  /** Label for the group */
  label?: string;
  /** Description for the group */
  description?: string;
  /** Array of fields in this group */
  fields: FormLayoutField<TShape>[];
  /** Additional CSS classes for the group */
  className?: string;
  /** Whether the group should be collapsible */
  collapsible?: boolean;
  /** Whether the group is initially collapsed (if collapsible) */
  defaultCollapsed?: boolean;
}

/**
 * Represents a complete layout configuration.
 */
export interface Layout<TShape extends ObjectShape> {
  /** Type of layout */
  type: "form" | "grid" | "tabs" | "accordion" | "custom" | "table";
  /** Groups of fields within the layout */
  groups: LayoutGroup<TShape>[];
  /** Additional CSS classes for the layout */
  className?: string;
  /** Layout-specific configuration */
  config?: {
    /** Number of columns for grid layouts */
    columns?: number;
    /** Gap between elements */
    gap?: string | number;
    /** Other layout-specific options */
    [key: string]: any;
  };
  /** Layout metadata - can contain any metadata, specific layouts may have specific metadata */
  metadata?: Record<string, any>;
}

/**
 * Form layout specific interface
 */
export interface FormLayout<TShape extends ObjectShape> extends Layout<TShape> {
  type: "form";
  groups: LayoutGroup<TShape>[];
}

/**
 * Table layout specific field
 */
export interface TableLayoutField<TShape extends ObjectShape> {
  /** The name of the field - must be a valid property key from the object shape */
  name: keyof TShape;
  /** Additional CSS classes for styling */
  className?: string;
  /** Whether the field should be hidden */
  hidden?: boolean;
  /** Column width in pixels - unlike fieldWidth, this is in pixels */
  columnWidthPx?: number;
  /** Whether the column should be pinned/frozen to the left */
  pinned?: boolean;
}

/**
 * Table layout specific interface
 */
export interface TableLayout<TShape extends ObjectShape>
  extends Layout<TShape> {
  type: "table";
  /** For tables, we only have one group internally but expose fields directly */
  groups: LayoutGroup<TShape>[];
  /** Table-specific metadata */
  metadata?: {
    /** Fields that should be clickable links to view the entity */
    linkFields?: (keyof TShape)[];
    /** Other metadata */
    [key: string]: any;
  };
}

/**
 * Type representing multiple layouts for an object schema.
 */
export type ObjectLayouts<TShape extends ObjectShape> = {
  [layoutName: string]: Layout<TShape>;
};

/**
 * Type representing multiple form layouts
 */
export type FormLayouts<TShape extends ObjectShape> = {
  [layoutName: string]: FormLayout<TShape>;
};

/**
 * Type representing multiple table layouts
 */
export type TableLayouts<TShape extends ObjectShape> = {
  [layoutName: string]: TableLayout<TShape>;
};

/**
 * ObjectSchema with optional catchall.
 *
 * Note on typing: When using .catchall(), the output type remains ObjectOutput<TShape>.
 * TypeScript cannot express "extra keys have type X" without conflicting with defined keys.
 * The catchall provides runtime validation and passthrough behavior, but dynamic keys
 * should be accessed via type assertion: `(data as any).dynamicKey` or `data["dynamicKey"]`.
 */
export class ObjectSchema<
  TShape extends ObjectShape = any,
  TCatchall extends BaseSchema<any> | null = null,
> extends BaseSchema<ObjectOutput<TShape>> {
  readonly type = "object" as const;
  _shape: TShape;
  _computedMeta: ObjectComputedMetadata<TShape> = {};
  _layouts: ObjectLayouts<TShape> = {};
  _idField: keyof ObjectOutput<TShape> = "id" as keyof ObjectOutput<TShape>;
  _catchall: TCatchall = null as TCatchall;

  constructor(shape: TShape, catchall?: TCatchall) {
    super();
    this._shape = shape;
    if (catchall) {
      this._catchall = catchall;
    }
  }

  /**
   * Allow additional properties beyond the defined shape, validated against the provided schema.
   * Similar to Zod's .catchall() method.
   *
   * @example
   * const chartDataSchema = nu.object({ category: nu.string() }).catchall(nu.number());
   * // Validates: { category: "Jan", desktop: 186, mobile: 80 }
   *
   * @param schema The schema to validate additional properties against.
   * @returns A new ObjectSchema that allows additional properties.
   */
  catchall<TCatchallSchema extends BaseSchema<any>>(
    schema: TCatchallSchema,
  ): ObjectSchema<TShape, TCatchallSchema> {
    const newSchema = new ObjectSchema<TShape, TCatchallSchema>(
      this._shape,
      schema,
    );

    // Copy metadata from parent schema
    newSchema._meta = { ...this._meta } as any;
    newSchema._computedMeta = { ...this._computedMeta };
    newSchema._layouts = { ...this._layouts };
    newSchema._idField = this._idField;

    return newSchema;
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
   * Add layouts to the object schema.
   * @param layouts Object mapping layout names to layout configurations.
   * @returns The schema instance for chaining.
   * @deprecated Use withFormLayouts or withTableLayouts instead
   */
  withLayouts(layouts: ObjectLayouts<TShape>): this {
    this._layouts = layouts;
    return this;
  }

  /**
   * Add form layouts to the object schema.
   * @param layouts Object mapping layout names to form layout configurations.
   * @returns The schema instance for chaining.
   */
  withFormLayouts(layouts: FormLayouts<TShape>): this {
    // Form layouts are stored directly in _layouts
    this._layouts = { ...this._layouts, ...layouts };
    return this;
  }

  /**
   * Add table layouts to the object schema.
   * @param layouts Object mapping layout names to table layout configurations with fields and optional linkFields.
   * @returns The schema instance for chaining.
   */
  withTableLayouts(layouts: {
    [layoutName: string]: {
      fields: TableLayoutField<TShape>[];
      className?: string;
      config?: Layout<TShape>["config"];
      metadata?: {
        linkFields?: (keyof TShape)[];
        [key: string]: any;
      };
    };
  }): this {
    // Convert the table-specific format to internal Layout format
    const tableLayouts: TableLayouts<TShape> = {};

    for (const [name, tableConfig] of Object.entries(layouts)) {
      // Create a single group with all fields for internal consistency
      tableLayouts[name] = {
        type: "table",
        groups: [
          {
            fields: tableConfig.fields,
          },
        ],
        className: tableConfig.className,
        config: tableConfig.config,
        metadata: tableConfig.metadata,
      };
    }

    this._layouts = { ...this._layouts, ...tableLayouts };
    return this;
  }

  /**
   * Specify which field serves as the unique identifier for this object schema.
   * This is used by resource operations to determine how to identify specific records.
   * @param idField The field name or a selector function that returns the ID field.
   * @returns The schema instance for chaining.
   */
  withId<K extends keyof ObjectOutput<TShape>>(
    idField: K | ((schema: ObjectOutput<TShape>) => ObjectOutput<TShape>[K]),
  ): this {
    if (typeof idField === "function") {
      // For function form, we need to extract the field name
      // This is a bit tricky, but for now we'll assume the user passes the field name directly
      throw new Error(
        "Function form of withId is not yet supported. Please pass the field name directly.",
      );
    }
    this._idField = idField;
    return this;
  }

  /**
   * Get the ID field name for this object schema.
   * @returns The field name that serves as the unique identifier.
   */
  getIdField(): keyof ObjectOutput<TShape> {
    return this._idField;
  }

  /**
   * Get a specific layout by name.
   * @param layoutName The name of the layout to retrieve.
   * @returns The layout configuration or undefined if not found.
   */
  getLayout(layoutName: string): Layout<TShape> | undefined {
    return this._layouts[layoutName];
  }

  /**
   * Get all available layout names.
   * @returns Array of layout names.
   */
  getLayoutNames(): string[] {
    return Object.keys(this._layouts);
  }

  /**
   * Check if a layout exists.
   * @param layoutName The name of the layout to check.
   * @returns True if the layout exists, false otherwise.
   */
  hasLayout(layoutName: string): boolean {
    return layoutName in this._layouts;
  }

  /**
   * Get the computed metadata for a specific property.
   * @param key The property key.
   * @param data The parsed object data to pass to computed functions.
   * @returns Promise resolving to the computed metadata.
   */
  async getComputedMeta(
    key: keyof TShape,
    data: ObjectOutput<TShape>,
  ): Promise<Partial<SchemaMetadata<TShape[typeof key]["_outputType"]>>> {
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
  async getAllComputedMeta(
    data: ObjectOutput<TShape>,
  ): Promise<Record<keyof TShape, Partial<SchemaMetadata<any>>>> {
    const result: any = {};

    for (const key in this._shape) {
      result[key] = await this.getComputedMeta(key, data);
    }

    return result;
  }

  /**
   * Get merged metadata (static + computed) for all properties.
   * @param data The current form data to pass to computed functions.
   * @returns Promise resolving to a map of property keys to merged metadata.
   */
  async getAllMergedMeta(
    data: Partial<ObjectOutput<TShape>>,
  ): Promise<Record<keyof TShape, SchemaMetadata<any>>> {
    const result: any = {};

    // Start with static metadata for each property
    for (const key in this._shape) {
      if (Object.hasOwn(this._shape, key)) {
        let schema = this._shape[key];
        if (schema) {
          // If it's an OptionalSchema, get the wrapped schema's metadata
          if (schema instanceof OptionalSchema) {
            schema = schema._wrapped;
          }
          result[key] = { ...(schema?._meta || {}) };
        }
      }
    }

    // Only compute if we have computed metadata and valid data
    if (Object.keys(this._computedMeta).length > 0) {
      try {
        // Try to create a complete object for computed functions
        // Use provided data and fill missing properties with default values
        const completeData: any = {};
        for (const key in this._shape) {
          if (Object.hasOwn(this._shape, key)) {
            const schema = this._shape[key];
            if (schema) {
              // If it's an OptionalSchema, use the wrapped schema for type checking
              const actualSchema =
                schema instanceof OptionalSchema ? schema._wrapped : schema;

              if ((data as any)[key] !== undefined) {
                completeData[key] = (data as any)[key];
              } else if (actualSchema._meta.defaultValue !== undefined) {
                completeData[key] = actualSchema._meta.defaultValue;
              } else {
                // Provide reasonable defaults for computation
                if (actualSchema instanceof StringSchema) {
                  completeData[key] = "";
                } else if (actualSchema instanceof NumberSchema) {
                  completeData[key] = 0;
                } else if (actualSchema instanceof BooleanSchema) {
                  completeData[key] = false;
                } else {
                  completeData[key] = null;
                }
              }
            }
          }
        }

        // Compute all metadata at once
        const computedMeta = await this.getAllComputedMeta(
          completeData as ObjectOutput<TShape>,
        );

        // Merge computed metadata with static metadata
        for (const key in computedMeta) {
          if (computedMeta[key]) {
            result[key] = {
              ...result[key],
              ...computedMeta[key],
            };
          }
        }
      } catch (error) {
        // If computation fails, just use static metadata
        console.warn("Failed to compute metadata:", error);
      }
    }

    return result;
  }

  /**
   * Create a new ObjectSchema with certain properties omitted.
   * @param keys The property keys to omit from the schema.
   * @returns A new ObjectSchema without the specified properties.
   */
  omit<K extends keyof TShape>(...keys: K[]): ObjectSchema<Omit<TShape, K>> {
    const newShape: any = {};
    const keysToOmit = new Set(keys);

    for (const key in this._shape) {
      if (Object.hasOwn(this._shape, key) && !keysToOmit.has(key as any)) {
        newShape[key] = this._shape[key];
      }
    }

    const newSchema = new ObjectSchema(newShape);

    // Copy metadata from parent schema
    newSchema._meta = { ...this._meta };

    // Copy computed metadata, excluding omitted keys
    const newComputedMeta: any = {};
    for (const key in this._computedMeta) {
      if (!keysToOmit.has(key as any)) {
        newComputedMeta[key] = this._computedMeta[key];
      }
    }
    newSchema._computedMeta = newComputedMeta;

    // Copy layouts, updating field references to exclude omitted keys
    const newLayouts: any = {};
    for (const layoutName in this._layouts) {
      const originalLayout = this._layouts[layoutName];
      if (originalLayout) {
        const newGroups = originalLayout.groups.map((group) => ({
          ...group,
          fields: group.fields.filter(
            (field) => !keysToOmit.has(field.name as any),
          ),
        }));
        newLayouts[layoutName] = {
          ...originalLayout,
          groups: newGroups,
        };
      }
    }
    newSchema._layouts = newLayouts;

    return newSchema;
  }

  /**
   * Create a new ObjectSchema with additional or modified properties.
   * @param shape The new properties to add or existing properties to modify.
   * @returns A new ObjectSchema with the extended shape.
   */
  extend<TExtend extends ObjectShape>(
    shape: TExtend,
  ): ObjectSchema<TShape & TExtend> {
    const newShape = { ...this._shape, ...shape } as TShape & TExtend;
    const newSchema = new ObjectSchema(newShape);

    // Copy metadata from parent schema (with proper typing)
    newSchema._meta = { ...this._meta } as any;

    // Copy computed metadata from parent schema (with proper typing)
    newSchema._computedMeta = { ...this._computedMeta } as any;

    // Copy layouts from parent schema - new fields won't appear in layouts unless explicitly added
    newSchema._layouts = { ...this._layouts } as any;

    return newSchema;
  }

  /**
   * Create a new ObjectSchema where all top-level properties become optional.
   * This wraps each field in an OptionalSchema, similar to how Zod handles partial.
   * @returns A new ObjectSchema where all properties are optional.
   */
  partial(): ObjectSchema<{ [K in keyof TShape]: OptionalSchema<TShape[K]> }> {
    const partialShape: any = {};

    // Wrap each field in OptionalSchema if not already optional
    for (const key in this._shape) {
      if (Object.hasOwn(this._shape, key)) {
        const fieldSchema = this._shape[key];
        if (fieldSchema) {
          if (fieldSchema instanceof OptionalSchema) {
            // Already optional, keep as is
            partialShape[key] = fieldSchema;
          } else {
            // Wrap in OptionalSchema to make it optional
            partialShape[key] = fieldSchema.optional();
          }
        }
      }
    }

    const partialSchema = new ObjectSchema(partialShape);

    // Copy metadata from parent schema
    partialSchema._meta = { ...this._meta };

    // Copy computed metadata from parent schema
    partialSchema._computedMeta = { ...this._computedMeta };

    // Copy layouts from parent schema
    partialSchema._layouts = { ...this._layouts };

    return partialSchema;
  }

  toZod(): z.ZodSchema<ObjectOutput<TShape>> {
    const zodShape: Record<string, z.ZodTypeAny> = {};
    for (const key in this._shape) {
      if (Object.hasOwn(this._shape, key) && this._shape[key]) {
        const fieldSchema = this._shape[key];
        zodShape[key] = fieldSchema.toZod();
      }
    }

    const baseZod = z.object(zodShape);

    // If catchall is defined, use it to allow additional properties
    if (this._catchall) {
      return baseZod.catchall(this._catchall.toZod()) as any;
    }

    return baseZod as any;
  }

  /**
   * Returns a Zod schema with URL coercion enabled.
   * This automatically converts string values from URL parameters to the expected types:
   * - "37" → 37 (number)
   * - "true" → true (boolean)
   * - "hello" → "hello" (string, unchanged)
   *
   * Use this when parsing URL search params that arrive as strings but need to be typed.
   *
   * @returns A Zod schema with coercion for URL parameter parsing
   */
  toZodWithCoercion(): z.ZodSchema<ObjectOutput<TShape>> {
    const zodShape: Record<string, z.ZodTypeAny> = {};

    for (const key in this._shape) {
      if (Object.hasOwn(this._shape, key) && this._shape[key]) {
        const fieldSchema = this._shape[key];
        const baseZodSchema = fieldSchema.toZod();

        // Apply coercion based on the field's type
        const wrappedType =
          fieldSchema.type === "optional"
            ? (fieldSchema as OptionalSchema<any>)._wrapped.type
            : null;

        if (fieldSchema.type === "number" || wrappedType === "number") {
          const coercedSchema = z.coerce.number();
          // For optional fields, preserve the optional nature
          if (fieldSchema.type === "optional") {
            zodShape[key] = coercedSchema.nullable().optional();
          } else {
            zodShape[key] = coercedSchema;
          }
        } else if (
          fieldSchema.type === "boolean" ||
          wrappedType === "boolean"
        ) {
          // Custom boolean coercion that properly handles "false" and "true" strings
          const customBooleanCoercion = z.preprocess((val) => {
            if (typeof val === "string") {
              const lower = val.toLowerCase();
              if (lower === "true" || lower === "1") return true;
              if (lower === "false" || lower === "0") return false;
            }
            return val;
          }, z.boolean());

          // For optional fields, preserve the optional nature
          if (fieldSchema.type === "optional") {
            zodShape[key] = customBooleanCoercion.nullable().optional();
          } else {
            zodShape[key] = customBooleanCoercion;
          }
        } else {
          // For strings and other types, use the original schema
          zodShape[key] = baseZodSchema;
        }
      }
    }
    return z.object(zodShape) as z.ZodSchema<ObjectOutput<TShape>>;
  }
}

/**
 * Infers the TypeScript output type from an element schema for an array.
 */
export type ArrayOutput<TElementSchema extends BaseSchema<any>> = Array<
  TElementSchema["_outputType"]
>;

export class ArraySchema<
  TElementSchema extends BaseSchema<any>,
> extends BaseSchema<ArrayOutput<TElementSchema>> {
  readonly type = "array" as const;
  _element: TElementSchema;

  constructor(elementSchema: TElementSchema) {
    super();
    this._element = elementSchema;
  }

  toZod(): z.ZodArray<z.ZodSchema<TElementSchema["_outputType"]>> {
    return z.array(this._element.toZod());
  }
}

/**
 * RecordSchema represents a dictionary/map type with string keys and values of a specific type.
 * Similar to TypeScript's Record<string, T> or Zod's z.record().
 *
 * @example
 * const scoresSchema = nu.record(nu.number());
 * // Represents: { [key: string]: number }
 */
export class RecordSchema<
  TValueSchema extends BaseSchema<any>,
> extends BaseSchema<Record<string, TValueSchema["_outputType"]>> {
  readonly type = "record" as const;
  _valueSchema: TValueSchema;

  constructor(valueSchema: TValueSchema) {
    super();
    this._valueSchema = valueSchema;
  }

  toZod(): z.ZodRecord<z.ZodString, z.ZodSchema<TValueSchema["_outputType"]>> {
    return z.record(z.string(), this._valueSchema.toZod());
  }
}

/**
 * Infers the TypeScript type from a schema.
 * @example
 * const userSchema = nu.object({ name: nu.string() });
 * type User = Infer&lt;typeof userSchema&gt;; // { name: string }
 */
export type Infer<T extends BaseSchema<any>> = T["_outputType"];

// Refine NuSchema union after defining concrete types
export type NuSchema =
  | BooleanSchema
  | StringSchema
  | NumberSchema
  | OptionalSchema<any>
  | ObjectSchema<any>
  | ArraySchema<any>
  | RecordSchema<any>;
