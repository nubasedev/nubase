// Define metadata types
export interface SchemaMetadata<Output = any> {
  label?: string;
  description?: string;
  defaultValue?: Output;
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
}

// --- Primitive Schemas ---

export class BooleanSchema extends BaseSchema<boolean> {
  readonly type = "boolean" as const;
}

export class StringSchema extends BaseSchema<string> {
  readonly type = "string" as const;
  // Add string-specific validation methods here (e.g., minLength, pattern)
}

export class NumberSchema extends BaseSchema<number> {
  readonly type = "number" as const;
  // Add number-specific validation methods here (e.g., min, max)
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
 * Infers the TypeScript output type for a partial ObjectShape.
 * All properties become optional.
 */
export type PartialObjectOutput<TShape extends ObjectShape> = {
  [K in keyof TShape]?: TShape[K]["_outputType"];
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
export interface LayoutField<TShape extends ObjectShape> {
  /** The name of the field - must be a valid property key from the object shape */
  name: keyof TShape;
  /** Size/width of the field (e.g., 12 for full width, 6 for half width in a 12-column grid) */
  size?: number;
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
  fields: LayoutField<TShape>[];
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
  type: "form" | "grid" | "tabs" | "accordion" | "custom";
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
}

/**
 * Type representing multiple layouts for an object schema.
 */
export type ObjectLayouts<TShape extends ObjectShape> = {
  [layoutName: string]: Layout<TShape>;
};

/**
 * A partial object schema where all properties are optional.
 * Extends BaseSchema with partial output type.
 */
export class PartialObjectSchema<TShape extends ObjectShape> extends BaseSchema<
  PartialObjectOutput<TShape>
> {
  readonly type = "partial-object" as const;
  _shape: TShape;
  _computedMeta: ObjectComputedMetadata<TShape> = {};
  _layouts: ObjectLayouts<TShape> = {};

  constructor(shape: TShape) {
    super();
    this._shape = shape;
  }

  /**
   * Add computed metadata to the partial object schema.
   * @param computedMeta Object mapping property keys to computed metadata functions.
   * @returns The schema instance for chaining.
   */
  withComputed(computedMeta: ObjectComputedMetadata<TShape>): this {
    this._computedMeta = computedMeta;
    return this;
  }

  /**
   * Add layouts to the partial object schema.
   * @param layouts Object mapping layout names to layout configurations.
   * @returns The schema instance for chaining.
   */
  withLayouts(layouts: ObjectLayouts<TShape>): this {
    this._layouts = layouts;
    return this;
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
    data: PartialObjectOutput<TShape>,
  ): Promise<Partial<SchemaMetadata<TShape[typeof key]["_outputType"]>>> {
    const computedMeta = this._computedMeta[key];
    if (!computedMeta) {
      return {};
    }

    const result: any = {};

    if (computedMeta.label) {
      result.label = await computedMeta.label(data as ObjectOutput<TShape>);
    }

    if (computedMeta.description) {
      result.description = await computedMeta.description(
        data as ObjectOutput<TShape>,
      );
    }

    if (computedMeta.defaultValue) {
      result.defaultValue = await computedMeta.defaultValue(
        data as ObjectOutput<TShape>,
      );
    }

    return result;
  }

  /**
   * Get all computed metadata for all properties.
   * @param data The parsed object data to pass to computed functions.
   * @returns Promise resolving to a map of property keys to computed metadata.
   */
  async getAllComputedMeta(
    data: PartialObjectOutput<TShape>,
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
    data: Partial<PartialObjectOutput<TShape>>,
  ): Promise<Record<keyof TShape, SchemaMetadata<any>>> {
    const result: any = {};

    // Start with static metadata for each property
    for (const key in this._shape) {
      if (Object.hasOwn(this._shape, key)) {
        const schema = this._shape[key];
        if (schema) {
          result[key] = { ...schema._meta };
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
              if (data[key] !== undefined) {
                completeData[key] = data[key];
              } else if (schema._meta.defaultValue !== undefined) {
                completeData[key] = schema._meta.defaultValue;
              } else {
                // Provide reasonable defaults for computation
                if (schema instanceof StringSchema) {
                  completeData[key] = "";
                } else if (schema instanceof NumberSchema) {
                  completeData[key] = 0;
                } else if (schema instanceof BooleanSchema) {
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
          completeData as PartialObjectOutput<TShape>,
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
   * Create a new PartialObjectSchema with certain properties omitted.
   * @param keys The property keys to omit from the schema.
   * @returns A new PartialObjectSchema without the specified properties.
   */
  omit<K extends keyof TShape>(
    ...keys: K[]
  ): PartialObjectSchema<Omit<TShape, K>> {
    const newShape: any = {};
    const keysToOmit = new Set(keys);

    for (const key in this._shape) {
      if (Object.hasOwn(this._shape, key) && !keysToOmit.has(key as any)) {
        newShape[key] = this._shape[key];
      }
    }

    const newSchema = new PartialObjectSchema(newShape);

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
   * Create a new PartialObjectSchema with additional or modified properties.
   * @param shape The new properties to add or existing properties to modify.
   * @returns A new PartialObjectSchema with the extended shape.
   */
  extend<TExtend extends ObjectShape>(
    shape: TExtend,
  ): PartialObjectSchema<TShape & TExtend> {
    const newShape = { ...this._shape, ...shape } as TShape & TExtend;
    const newSchema = new PartialObjectSchema(newShape);

    // Copy metadata from parent schema (with proper typing)
    newSchema._meta = { ...this._meta } as any;

    // Copy computed metadata from parent schema (with proper typing)
    newSchema._computedMeta = { ...this._computedMeta } as any;

    // Copy layouts from parent schema - new fields won't appear in layouts unless explicitly added
    newSchema._layouts = { ...this._layouts } as any;

    return newSchema;
  }
}

export class ObjectSchema<TShape extends ObjectShape = any> extends BaseSchema<
  ObjectOutput<TShape>
> {
  readonly type = "object" as const;
  _shape: TShape;
  _computedMeta: ObjectComputedMetadata<TShape> = {};
  _layouts: ObjectLayouts<TShape> = {};

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
   * Add layouts to the object schema.
   * @param layouts Object mapping layout names to layout configurations.
   * @returns The schema instance for chaining.
   */
  withLayouts(layouts: ObjectLayouts<TShape>): this {
    this._layouts = layouts;
    return this;
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
        const schema = this._shape[key];
        if (schema) {
          result[key] = { ...schema._meta };
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
              if ((data as any)[key] !== undefined) {
                completeData[key] = (data as any)[key];
              } else if (schema._meta.defaultValue !== undefined) {
                completeData[key] = schema._meta.defaultValue;
              } else {
                // Provide reasonable defaults for computation
                if (schema instanceof StringSchema) {
                  completeData[key] = "";
                } else if (schema instanceof NumberSchema) {
                  completeData[key] = 0;
                } else if (schema instanceof BooleanSchema) {
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
   * Create a new PartialObjectSchema where all top-level properties become optional.
   * @returns A new PartialObjectSchema where all properties are optional.
   */
  partial(): PartialObjectSchema<TShape> {
    const partialSchema = new PartialObjectSchema(this._shape);

    // Copy metadata from parent schema
    partialSchema._meta = { ...this._meta };

    // Copy computed metadata from parent schema
    partialSchema._computedMeta = { ...this._computedMeta };

    // Copy layouts from parent schema
    partialSchema._layouts = { ...this._layouts };

    return partialSchema;
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
  | PartialObjectSchema<any>
  | ArraySchema<any>;
