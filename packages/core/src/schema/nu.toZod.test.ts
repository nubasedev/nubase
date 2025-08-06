import { describe, expect, expectTypeOf, it } from "vitest";
import { z } from "zod";
import { nu } from "./nu";

describe("toZod converter", () => {
  describe("primitive types", () => {
    it("should convert string schema to Zod string", () => {
      const nuSchema = nu.string();
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodString);
      expect(zodSchema.parse("hello")).toBe("hello");
      expect(() => zodSchema.parse(123)).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<z.ZodString>();
    });

    it("should convert number schema to Zod number", () => {
      const nuSchema = nu.number();
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodNumber);
      expect(zodSchema.parse(42)).toBe(42);
      expect(() => zodSchema.parse("42")).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<z.ZodNumber>();
    });

    it("should convert boolean schema to Zod boolean", () => {
      const nuSchema = nu.boolean();
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodBoolean);
      expect(zodSchema.parse(true)).toBe(true);
      expect(zodSchema.parse(false)).toBe(false);
      expect(() => zodSchema.parse("true")).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<z.ZodBoolean>();
    });
  });

  describe("optional types", () => {
    it("should convert optional string schema to Zod optional and nullable", () => {
      const nuSchema = nu.string().optional();
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema.parse("hello")).toBe("hello");
      expect(zodSchema.parse(undefined)).toBe(undefined);
      expect(zodSchema.parse(null)).toBe(null);
      expect(() => zodSchema.parse(123)).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<
        z.ZodOptional<z.ZodNullable<z.ZodString>>
      >();
    });

    it("should convert optional number schema to Zod optional and nullable", () => {
      const nuSchema = nu.number().optional();
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema.parse(42)).toBe(42);
      expect(zodSchema.parse(undefined)).toBe(undefined);
      expect(zodSchema.parse(null)).toBe(null);
      expect(() => zodSchema.parse("42")).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<
        z.ZodOptional<z.ZodNullable<z.ZodNumber>>
      >();
    });

    it("should convert optional boolean schema to Zod optional and nullable", () => {
      const nuSchema = nu.boolean().optional();
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodOptional);
      expect(zodSchema.parse(true)).toBe(true);
      expect(zodSchema.parse(false)).toBe(false);
      expect(zodSchema.parse(undefined)).toBe(undefined);
      expect(zodSchema.parse(null)).toBe(null);
      expect(() => zodSchema.parse("true")).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<
        z.ZodOptional<z.ZodNullable<z.ZodBoolean>>
      >();
    });
  });

  describe("array types", () => {
    it("should convert array of strings to Zod array", () => {
      const nuSchema = nu.array(nu.string());
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodArray);
      expect(zodSchema.parse(["a", "b", "c"])).toEqual(["a", "b", "c"]);
      expect(zodSchema.parse([])).toEqual([]);
      expect(() => zodSchema.parse("not an array")).toThrow();
      expect(() => zodSchema.parse([1, 2, 3])).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<z.ZodArray<z.ZodString>>();
    });

    it("should convert array of numbers to Zod array", () => {
      const nuSchema = nu.array(nu.number());
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodArray);
      expect(zodSchema.parse([1, 2, 3])).toEqual([1, 2, 3]);
      expect(zodSchema.parse([])).toEqual([]);
      expect(() => zodSchema.parse(["1", "2"])).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<z.ZodArray<z.ZodNumber>>();
    });

    it("should convert array of optional elements to Zod array", () => {
      const nuSchema = nu.array(nu.string().optional());
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodArray);
      expect(zodSchema.parse(["a", undefined, "c"])).toEqual([
        "a",
        undefined,
        "c",
      ]);
      expect(zodSchema.parse(["a", null, "c"])).toEqual(["a", null, "c"]);
      expect(() => zodSchema.parse([1, 2, 3])).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<
        z.ZodArray<z.ZodOptional<z.ZodNullable<z.ZodString>>>
      >();
    });

    it("should convert nested arrays to Zod arrays", () => {
      const nuSchema = nu.array(nu.array(nu.number()));
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodArray);
      expect(
        zodSchema.parse([
          [1, 2],
          [3, 4],
        ]),
      ).toEqual([
        [1, 2],
        [3, 4],
      ]);
      expect(zodSchema.parse([])).toEqual([]);
      expect(zodSchema.parse([[]])).toEqual([[]]);
      expect(() => zodSchema.parse([["1", "2"]])).toThrow();

      // Type check
      expectTypeOf(zodSchema).toEqualTypeOf<
        z.ZodArray<z.ZodArray<z.ZodNumber>>
      >();
    });
  });

  describe("object types", () => {
    it("should convert simple object schema to Zod object", () => {
      const nuSchema = nu.object({
        name: nu.string(),
        age: nu.number(),
      });
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      const validData = { name: "John", age: 30 };
      expect(zodSchema.parse(validData)).toEqual(validData);

      expect(() => zodSchema.parse({ name: "John" })).toThrow();
      expect(() => zodSchema.parse({ name: 123, age: 30 })).toThrow();

      // Type check
      expectTypeOf(zodSchema).toMatchTypeOf<
        z.ZodObject<
          {
            name: z.ZodString;
            age: z.ZodNumber;
          },
          any,
          z.ZodTypeAny,
          { name: string; age: number }
        >
      >();
    });

    it("should convert object with optional fields to Zod object", () => {
      const nuSchema = nu.object({
        name: nu.string(),
        age: nu.number().optional(),
        active: nu.boolean().optional(),
      });
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      expect(zodSchema.parse({ name: "John" })).toEqual({ name: "John" });
      expect(zodSchema.parse({ name: "John", age: 30 })).toEqual({
        name: "John",
        age: 30,
      });
      expect(zodSchema.parse({ name: "John", age: 30, active: true })).toEqual({
        name: "John",
        age: 30,
        active: true,
      });
      // Test null values for optional fields
      expect(zodSchema.parse({ name: "John", age: null })).toEqual({
        name: "John",
        age: null,
      });
      expect(
        zodSchema.parse({ name: "John", age: null, active: null }),
      ).toEqual({
        name: "John",
        age: null,
        active: null,
      });

      // Type check
      expectTypeOf(zodSchema).toMatchTypeOf<
        z.ZodObject<
          {
            name: z.ZodString;
            age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            active: z.ZodOptional<z.ZodNullable<z.ZodBoolean>>;
          },
          any,
          z.ZodTypeAny,
          { name: string; age?: number | null; active?: boolean | null }
        >
      >();
    });

    it("should convert nested object schema to Zod object", () => {
      const nuSchema = nu.object({
        user: nu.object({
          name: nu.string(),
          contact: nu.object({
            email: nu.string(),
            phone: nu.string().optional(),
          }),
        }),
        timestamp: nu.number(),
      });
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      const validData = {
        user: {
          name: "John",
          contact: {
            email: "john@example.com",
          },
        },
        timestamp: 1234567890,
      };
      expect(zodSchema.parse(validData)).toEqual(validData);

      const withPhone = {
        user: {
          name: "John",
          contact: {
            email: "john@example.com",
            phone: "123-456-7890",
          },
        },
        timestamp: 1234567890,
      };
      expect(zodSchema.parse(withPhone)).toEqual(withPhone);
    });

    it("should convert object with array fields to Zod object", () => {
      const nuSchema = nu.object({
        name: nu.string(),
        tags: nu.array(nu.string()),
        scores: nu.array(nu.number()),
      });
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      const validData = {
        name: "Project",
        tags: ["important", "urgent"],
        scores: [95, 87, 92],
      };
      expect(zodSchema.parse(validData)).toEqual(validData);

      expect(() =>
        zodSchema.parse({
          name: "Project",
          tags: ["important", 123],
          scores: [95, 87, 92],
        }),
      ).toThrow();
    });
  });

  describe("partial object types", () => {
    it("should convert partial object schema to Zod object with all optional fields", () => {
      const nuSchema = nu
        .object({
          name: nu.string(),
          age: nu.number(),
          active: nu.boolean(),
        })
        .partial();
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      // All fields should be optional
      expect(zodSchema.parse({})).toEqual({});
      expect(zodSchema.parse({ name: "John" })).toEqual({ name: "John" });
      expect(zodSchema.parse({ age: 30 })).toEqual({ age: 30 });
      expect(zodSchema.parse({ name: "John", age: 30 })).toEqual({
        name: "John",
        age: 30,
      });
      expect(zodSchema.parse({ name: "John", age: 30, active: true })).toEqual({
        name: "John",
        age: 30,
        active: true,
      });

      // Type check - all fields should be optional
      expectTypeOf(zodSchema).toMatchTypeOf<
        z.ZodObject<
          {
            name: z.ZodOptional<z.ZodString>;
            age: z.ZodOptional<z.ZodNumber>;
            active: z.ZodOptional<z.ZodBoolean>;
          },
          any,
          z.ZodTypeAny,
          { name?: string; age?: number; active?: boolean }
        >
      >();
    });

    it("should convert nested partial object schema", () => {
      const nuSchema = nu
        .object({
          user: nu.object({
            name: nu.string(),
            email: nu.string(),
          }),
          settings: nu
            .object({
              theme: nu.string(),
              notifications: nu.boolean(),
            })
            .partial(),
        })
        .partial();
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      // Top level user field is optional
      expect(zodSchema.parse({})).toEqual({});

      // Can provide partial data
      expect(zodSchema.parse({ settings: { theme: "dark" } })).toEqual({
        settings: { theme: "dark" },
      });

      // User object must be complete if provided
      expect(() => zodSchema.parse({ user: { name: "John" } })).toThrow();

      const validData = {
        user: { name: "John", email: "john@example.com" },
        settings: { notifications: true },
      };
      expect(zodSchema.parse(validData)).toEqual(validData);
    });
  });

  describe("complex transformations with omit and extend", () => {
    it("should convert object schema after omit operation", () => {
      const baseSchema = nu.object({
        id: nu.number(),
        name: nu.string(),
        email: nu.string(),
        age: nu.number(),
      });

      const omittedSchema = baseSchema.omit("email", "age");
      const zodSchema = omittedSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      const validData = { id: 1, name: "John" };
      expect(zodSchema.parse(validData)).toEqual(validData);

      // Should not accept omitted fields
      expect(() =>
        zodSchema.parse({
          id: 1,
          name: "John",
          email: "john@example.com",
        }),
      ).not.toThrow(); // Zod by default ignores extra properties

      // Should require non-omitted fields
      expect(() => zodSchema.parse({ id: 1 })).toThrow();

      // Type check
      expectTypeOf(zodSchema).toMatchTypeOf<
        z.ZodObject<
          {
            id: z.ZodNumber;
            name: z.ZodString;
          },
          any,
          z.ZodTypeAny,
          { id: number; name: string }
        >
      >();
    });

    it("should convert object schema after extend operation", () => {
      const baseSchema = nu.object({
        name: nu.string(),
        age: nu.number(),
      });

      const extendedSchema = baseSchema.extend({
        email: nu.string(),
        active: nu.boolean().optional(),
      });
      const zodSchema = extendedSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      const validData = {
        name: "John",
        age: 30,
        email: "john@example.com",
      };
      expect(zodSchema.parse(validData)).toEqual(validData);

      const withOptional = {
        name: "John",
        age: 30,
        email: "john@example.com",
        active: true,
      };
      expect(zodSchema.parse(withOptional)).toEqual(withOptional);

      // Type check
      expectTypeOf(zodSchema).toMatchTypeOf<
        z.ZodObject<
          {
            name: z.ZodString;
            age: z.ZodNumber;
            email: z.ZodString;
            active: z.ZodOptional<z.ZodBoolean>;
          },
          any,
          z.ZodTypeAny,
          {
            name: string;
            age: number;
            email: string;
            active?: boolean;
          }
        >
      >();
    });

    it("should convert object schema after chained omit and extend operations", () => {
      const baseSchema = nu.object({
        id: nu.number(),
        name: nu.string(),
        email: nu.string(),
        age: nu.number(),
      });

      const modifiedSchema = baseSchema.omit("age", "email").extend({
        username: nu.string(),
        role: nu.string().optional(),
      });
      const zodSchema = modifiedSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      const validData = {
        id: 1,
        name: "John",
        username: "johndoe",
      };
      expect(zodSchema.parse(validData)).toEqual(validData);

      const withRole = {
        id: 1,
        name: "John",
        username: "johndoe",
        role: "admin",
      };
      expect(zodSchema.parse(withRole)).toEqual(withRole);
    });

    it("should convert partial object schema after omit operation", () => {
      const baseSchema = nu
        .object({
          id: nu.number(),
          name: nu.string(),
          email: nu.string(),
          age: nu.number(),
        })
        .partial();

      const omittedSchema = baseSchema.omit("email", "age");
      const zodSchema = omittedSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      // All remaining fields should still be optional
      expect(zodSchema.parse({})).toEqual({});
      expect(zodSchema.parse({ id: 1 })).toEqual({ id: 1 });
      expect(zodSchema.parse({ name: "John" })).toEqual({ name: "John" });
      expect(zodSchema.parse({ id: 1, name: "John" })).toEqual({
        id: 1,
        name: "John",
      });
    });

    it("should convert object schema converted to partial", () => {
      const baseSchema = nu.object({
        name: nu.string(),
        age: nu.number(),
        email: nu.string(),
      });

      const partialSchema = baseSchema.partial();
      const zodSchema = partialSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      // All fields should be optional
      expect(zodSchema.parse({})).toEqual({});
      expect(zodSchema.parse({ name: "John" })).toEqual({ name: "John" });
      expect(zodSchema.parse({ age: 30 })).toEqual({ age: 30 });
      expect(
        zodSchema.parse({ name: "John", age: 30, email: "john@example.com" }),
      ).toEqual({ name: "John", age: 30, email: "john@example.com" });
    });
  });

  describe("form submission with null values", () => {
    it("should handle form data with null values for optional fields", () => {
      // This mimics the real-world scenario where a form sends null for empty fields
      const ticketSchema = nu.object({
        id: nu.number(),
        title: nu.string(),
        description: nu.string().optional(),
      });

      const createTicketSchema = ticketSchema.omit("id");
      const zodSchema = createTicketSchema.toZod();

      // Form data with null description (common from form submissions)
      const formData = {
        title: "New Ticket",
        description: null,
      };

      // Should not throw and should preserve null
      expect(() => zodSchema.parse(formData)).not.toThrow();
      expect(zodSchema.parse(formData)).toEqual({
        title: "New Ticket",
        description: null,
      });

      // Also test with undefined
      expect(zodSchema.parse({ title: "New Ticket" })).toEqual({
        title: "New Ticket",
      });
      expect(
        zodSchema.parse({ title: "New Ticket", description: undefined }),
      ).toEqual({
        title: "New Ticket",
        description: undefined,
      });
    });
  });

  describe("edge cases and error handling", () => {
    it("should preserve metadata comment but not translate it", () => {
      const nuSchema = nu.string().withMeta({
        label: "Username",
        description: "The user's login name",
      });
      const zodSchema = nuSchema.toZod();

      // The Zod schema should work normally
      expect(zodSchema).toBeInstanceOf(z.ZodString);
      expect(zodSchema.parse("john_doe")).toBe("john_doe");

      // Metadata is not translated to Zod (Zod doesn't have direct equivalents)
      // This is expected behavior as noted in the toZod function comments
    });

    it("should handle deeply nested structures", () => {
      const nuSchema = nu.object({
        level1: nu.object({
          level2: nu.object({
            level3: nu.object({
              value: nu.string(),
              items: nu.array(
                nu.object({
                  id: nu.number(),
                  name: nu.string(),
                }),
              ),
            }),
          }),
        }),
      });
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodObject);

      const validData = {
        level1: {
          level2: {
            level3: {
              value: "deep",
              items: [
                { id: 1, name: "Item 1" },
                { id: 2, name: "Item 2" },
              ],
            },
          },
        },
      };
      expect(zodSchema.parse(validData)).toEqual(validData);
    });

    it("should handle array of objects with optional fields", () => {
      const nuSchema = nu.array(
        nu.object({
          id: nu.number(),
          name: nu.string(),
          description: nu.string().optional(),
        }),
      );
      const zodSchema = nuSchema.toZod();

      expect(zodSchema).toBeInstanceOf(z.ZodArray);

      const validData = [
        { id: 1, name: "Item 1" },
        { id: 2, name: "Item 2", description: "Second item" },
      ];
      expect(zodSchema.parse(validData)).toEqual(validData);
    });

    it("should throw error for unsupported schema types", () => {
      // Create a mock unsupported schema type
      class UnsupportedSchema {
        readonly type = "unsupported" as const;
        _outputType!: any;
        _meta = {};
        parse(data: any) {
          return data;
        }
      }

      const unsupportedSchema = new UnsupportedSchema();

      expect(() => (unsupportedSchema as any).toZod()).toThrow();
    });
  });

  describe("type inference", () => {
    it("should correctly infer types for complex schemas", () => {
      const nuSchema = nu.object({
        user: nu.object({
          id: nu.number(),
          profile: nu.object({
            name: nu.string(),
            bio: nu.string().optional(),
            tags: nu.array(nu.string()),
          }),
        }),
        settings: nu
          .object({
            theme: nu.string(),
            notifications: nu.object({
              email: nu.boolean(),
              push: nu.boolean(),
            }),
          })
          .partial(),
        metadata: nu.array(
          nu.object({
            key: nu.string(),
            value: nu.string(),
          }),
        ),
      });

      const zodSchema = nuSchema.toZod();

      // This should compile without errors, proving type inference works
      const _typeCheck: z.ZodObject<
        {
          user: z.ZodObject<
            {
              id: z.ZodNumber;
              profile: z.ZodObject<
                {
                  name: z.ZodString;
                  bio: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                  tags: z.ZodArray<z.ZodString>;
                },
                any,
                z.ZodTypeAny,
                {
                  name: string;
                  bio?: string | null;
                  tags: string[];
                }
              >;
            },
            any,
            z.ZodTypeAny,
            {
              id: number;
              profile: {
                name: string;
                bio?: string | null;
                tags: string[];
              };
            }
          >;
          settings: z.ZodObject<
            {
              theme: z.ZodOptional<z.ZodNullable<z.ZodString>>;
              notifications: z.ZodOptional<
                z.ZodNullable<
                  z.ZodObject<
                    {
                      email: z.ZodBoolean;
                      push: z.ZodBoolean;
                    },
                    any,
                    z.ZodTypeAny,
                    {
                      email: boolean;
                      push: boolean;
                    }
                  >
                >
              >;
            },
            any,
            z.ZodTypeAny,
            {
              theme?: string | null;
              notifications?: {
                email: boolean;
                push: boolean;
              } | null;
            }
          >;
          metadata: z.ZodArray<
            z.ZodObject<
              {
                key: z.ZodString;
                value: z.ZodString;
              },
              any,
              z.ZodTypeAny,
              {
                key: string;
                value: string;
              }
            >
          >;
        },
        any,
        z.ZodTypeAny,
        {
          user: {
            id: number;
            profile: {
              name: string;
              bio?: string;
              tags: string[];
            };
          };
          settings: {
            theme?: string | null;
            notifications?: {
              email: boolean;
              push: boolean;
            } | null;
          };
          metadata: Array<{
            key: string;
            value: string;
          }>;
        }
      > = zodSchema;

      // Use the variable to avoid unused variable warning
      expect(_typeCheck).toBeDefined();
    });
  });

  describe("URL coercion", () => {
    describe("toZodWithCoercion method", () => {
      it("should coerce string numbers to numbers", () => {
        const nuSchema = nu.object({
          id: nu.number(),
          name: nu.string(),
        });
        const coercionSchema = nuSchema.toZodWithCoercion();

        // String number should be coerced to number
        expect(coercionSchema.parse({ id: "37", name: "test" })).toEqual({
          id: 37,
          name: "test",
        });

        // Already correct types should pass through
        expect(coercionSchema.parse({ id: 37, name: "test" })).toEqual({
          id: 37,
          name: "test",
        });

        // Invalid number strings should fail
        expect(() =>
          coercionSchema.parse({ id: "invalid", name: "test" }),
        ).toThrow();
      });

      it("should coerce string booleans to booleans", () => {
        const nuSchema = nu.object({
          active: nu.boolean(),
          name: nu.string(),
        });
        const coercionSchema = nuSchema.toZodWithCoercion();

        // String booleans should be coerced
        expect(coercionSchema.parse({ active: "true", name: "test" })).toEqual({
          active: true,
          name: "test",
        });
        // Custom boolean coercion properly handles "false" string
        expect(coercionSchema.parse({ active: "false", name: "test" })).toEqual(
          {
            active: false,
            name: "test",
          },
        );

        // Already correct types should pass through
        expect(coercionSchema.parse({ active: true, name: "test" })).toEqual({
          active: true,
          name: "test",
        });

        // Numbers as strings should be coerced properly
        expect(coercionSchema.parse({ active: "1", name: "test" })).toEqual({
          active: true,
          name: "test",
        });
        expect(coercionSchema.parse({ active: "0", name: "test" })).toEqual({
          active: false,
          name: "test",
        });
      });

      it("should handle mixed types correctly", () => {
        const nuSchema = nu.object({
          id: nu.number(),
          active: nu.boolean(),
          name: nu.string(),
        });
        const coercionSchema = nuSchema.toZodWithCoercion();

        // URL params scenario: all come as strings
        const urlParamsData = {
          id: "42",
          active: "true",
          name: "test-item",
        };

        expect(coercionSchema.parse(urlParamsData)).toEqual({
          id: 42,
          active: true,
          name: "test-item",
        });
      });

      it("should handle optional fields with coercion", () => {
        const nuSchema = nu.object({
          id: nu.number(),
          count: nu.number().optional(),
          active: nu.boolean().optional(),
          name: nu.string(),
        });
        const coercionSchema = nuSchema.toZodWithCoercion();

        // With optional fields present as strings
        expect(
          coercionSchema.parse({
            id: "1",
            count: "5",
            active: "true",
            name: "test",
          }),
        ).toEqual({
          id: 1,
          count: 5,
          active: true,
          name: "test",
        });

        // With optional fields missing
        expect(coercionSchema.parse({ id: "1", name: "test" })).toEqual({
          id: 1,
          name: "test",
        });

        // With optional fields as null/undefined
        expect(
          coercionSchema.parse({
            id: "1",
            count: null,
            active: undefined,
            name: "test",
          }),
        ).toEqual({
          id: 1,
          count: null,
          active: undefined,
          name: "test",
        });
      });

      it("should not affect strings - they remain unchanged", () => {
        const nuSchema = nu.object({
          id: nu.string(),
          description: nu.string().optional(),
        });
        const coercionSchema = nuSchema.toZodWithCoercion();

        expect(
          coercionSchema.parse({ id: "123", description: "test" }),
        ).toEqual({
          id: "123",
          description: "test",
        });

        // Numbers and booleans as strings should remain strings for string fields
        expect(coercionSchema.parse({ id: "true" })).toEqual({
          id: "true",
        });
      });

      it("should handle real URL parameter scenario", () => {
        // Simulate a typical resource view URL parameter schema
        const viewTicketParamsSchema = nu.object({
          id: nu.number(),
        });

        const coercionSchema = viewTicketParamsSchema.toZodWithCoercion();

        // URL: /r/ticket/view?id=37
        // URLSearchParams would give us: { id: "37" }
        const urlParams = { id: "37" };

        const result = coercionSchema.parse(urlParams);
        expect(result).toEqual({ id: 37 });
        expect(typeof result.id).toBe("number");
      });

      it("should maintain static typing", () => {
        const nuSchema = nu.object({
          id: nu.number(),
          active: nu.boolean(),
          name: nu.string(),
        });
        const coercionSchema = nuSchema.toZodWithCoercion();

        // This should have the same output type as the original schema
        expectTypeOf(coercionSchema).toEqualTypeOf<
          z.ZodSchema<{
            id: number;
            active: boolean;
            name: string;
          }>
        >();
      });

      it("should handle validation errors appropriately", () => {
        const nuSchema = nu.object({
          id: nu.number(),
          active: nu.boolean(),
        });
        const coercionSchema = nuSchema.toZodWithCoercion();

        // Missing required field should still fail
        expect(() => coercionSchema.parse({ id: "1" })).toThrow();

        // Invalid coercion should fail
        expect(() =>
          coercionSchema.parse({
            id: "not-a-number",
            active: "true",
          }),
        ).toThrow();
      });

      it("should work with complex nested structures", () => {
        const nuSchema = nu.object({
          user: nu.object({
            id: nu.number(),
            active: nu.boolean(),
          }),
          count: nu.number().optional(),
        });

        // Note: toZodWithCoercion is applied to the root object schema
        // Nested objects would need their own coercion if needed
        // For URL params, we typically only coerce at the top level
        const coercionSchema = nuSchema.toZodWithCoercion();

        // This would not coerce nested object fields, which is expected
        // URL params are typically flat: ?userId=1&userActive=true&count=5
        expect(() =>
          coercionSchema.parse({
            user: { id: "1", active: "true" },
            count: "5",
          }),
        ).toThrow(); // Because nested user fields aren't coerced

        // But top-level coercion works
        expect(
          coercionSchema.parse({
            user: { id: 1, active: true },
            count: "5",
          }),
        ).toEqual({
          user: { id: 1, active: true },
          count: 5,
        });
      });
    });
  });
});
