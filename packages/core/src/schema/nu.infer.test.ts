import { describe, expect, expectTypeOf, it } from "vitest";
import { nu } from "./nu";
import type { Infer } from "./schema";

describe("nubase Schema Library (nu) - Type Inference", () => {
  // --- Primitive Type Inference ---

  it("should infer string type correctly", () => {
    const stringSchema = nu.string();
    type StringType = Infer<typeof stringSchema>;

    expectTypeOf<StringType>().toEqualTypeOf<string>();

    const parsed = stringSchema.toZod().parse("hello");
    expectTypeOf(parsed).toEqualTypeOf<string>();
    expect(parsed).toBe("hello");
  });

  it("should infer number type correctly", () => {
    const numberSchema = nu.number();
    type NumberType = Infer<typeof numberSchema>;

    expectTypeOf<NumberType>().toEqualTypeOf<number>();

    const parsed = numberSchema.toZod().parse(42);
    expectTypeOf(parsed).toEqualTypeOf<number>();
    expect(parsed).toBe(42);
  });

  it("should infer boolean type correctly", () => {
    const booleanSchema = nu.boolean();
    type BooleanType = Infer<typeof booleanSchema>;

    expectTypeOf<BooleanType>().toEqualTypeOf<boolean>();

    const parsed = booleanSchema.toZod().parse(true);
    expectTypeOf(parsed).toEqualTypeOf<boolean>();
    expect(parsed).toBe(true);
  });

  // --- Optional Type Inference ---

  it("should infer optional string type correctly", () => {
    const optionalStringSchema = nu.string().optional();
    type OptionalStringType = Infer<typeof optionalStringSchema>;

    expectTypeOf<OptionalStringType>().toEqualTypeOf<string | undefined>();

    const parsedString = optionalStringSchema.toZod().parse("hello");
    expectTypeOf(parsedString).toEqualTypeOf<string | undefined>();
    expect(parsedString).toBe("hello");

    const parsedUndefined = optionalStringSchema.toZod().parse(undefined);
    expectTypeOf(parsedUndefined).toEqualTypeOf<string | undefined>();
    expect(parsedUndefined).toBeUndefined();
  });

  it("should infer optional number type correctly", () => {
    const optionalNumberSchema = nu.number().optional();
    type OptionalNumberType = Infer<typeof optionalNumberSchema>;

    expectTypeOf<OptionalNumberType>().toEqualTypeOf<number | undefined>();

    const parsed = optionalNumberSchema.toZod().parse(42);
    expect(parsed).toBe(42);

    const parsedUndefined = optionalNumberSchema.toZod().parse(undefined);
    expect(parsedUndefined).toBeUndefined();
  });

  it("should infer optional boolean type correctly", () => {
    const optionalBooleanSchema = nu.boolean().optional();
    type OptionalBooleanType = Infer<typeof optionalBooleanSchema>;

    expectTypeOf<OptionalBooleanType>().toEqualTypeOf<boolean | undefined>();

    const parsed = optionalBooleanSchema.toZod().parse(false);
    expect(parsed).toBe(false);

    const parsedUndefined = optionalBooleanSchema.toZod().parse(undefined);
    expect(parsedUndefined).toBeUndefined();
  });

  // --- Array Type Inference ---

  it("should infer array type correctly", () => {
    const arraySchema = nu.array(nu.string());
    type ArrayType = Infer<typeof arraySchema>;

    expectTypeOf<ArrayType>().toEqualTypeOf<string[]>();

    const parsed = arraySchema.toZod().parse(["hello", "world"]);
    expectTypeOf(parsed).toEqualTypeOf<string[]>();
    expect(parsed).toEqual(["hello", "world"]);
  });

  it("should infer optional array type correctly", () => {
    const optionalArraySchema = nu.array(nu.string()).optional();
    type OptionalArrayType = Infer<typeof optionalArraySchema>;

    expectTypeOf<OptionalArrayType>().toEqualTypeOf<string[] | undefined>();

    const parsed = optionalArraySchema.toZod().parse(["hello"]);
    expect(parsed).toEqual(["hello"]);

    const parsedUndefined = optionalArraySchema.toZod().parse(undefined);
    expect(parsedUndefined).toBeUndefined();
  });

  it("should infer array of optional elements correctly", () => {
    const arrayOfOptionalSchema = nu.array(nu.string().optional());
    type ArrayOfOptionalType = Infer<typeof arrayOfOptionalSchema>;

    expectTypeOf<ArrayOfOptionalType>().toEqualTypeOf<(string | undefined)[]>();

    const parsed = arrayOfOptionalSchema
      .toZod()
      .parse(["hello", undefined, "world"]);
    expect(parsed).toEqual(["hello", undefined, "world"]);
  });

  // --- Object Type Inference ---

  it("should infer object with all required fields correctly", () => {
    const userSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      active: nu.boolean(),
    });

    type UserType = Infer<typeof userSchema>;

    expectTypeOf<UserType>().toEqualTypeOf<{
      id: number;
      name: string;
      active: boolean;
    }>();

    const parsed = userSchema.toZod().parse({
      id: 1,
      name: "John",
      active: true,
    });

    expectTypeOf(parsed).toEqualTypeOf<{
      id: number;
      name: string;
      active: boolean;
    }>();

    expect(parsed).toEqual({
      id: 1,
      name: "John",
      active: true,
    });
  });

  it("should infer object with optional fields correctly", () => {
    const userSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      email: nu.string().optional(),
      age: nu.number().optional(),
    });

    type UserType = Infer<typeof userSchema>;

    expectTypeOf<UserType>().toEqualTypeOf<{
      id: number;
      name: string;
      email?: string | undefined;
      age?: number | undefined;
    }>();

    // Test with all fields
    const fullUser = userSchema.toZod().parse({
      id: 1,
      name: "John",
      email: "john@example.com",
      age: 30,
    });

    expect(fullUser).toEqual({
      id: 1,
      name: "John",
      email: "john@example.com",
      age: 30,
    });

    // Test with only required fields
    const minimalUser = userSchema.toZod().parse({
      id: 1,
      name: "John",
    });

    expect(minimalUser).toEqual({
      id: 1,
      name: "John",
    });

    // Test with some optional fields
    const partialUser = userSchema.toZod().parse({
      id: 1,
      name: "John",
      email: "john@example.com",
    });

    expect(partialUser).toEqual({
      id: 1,
      name: "John",
      email: "john@example.com",
    });
  });

  it("should infer object with all optional fields correctly", () => {
    const configSchema = nu.object({
      theme: nu.string().optional(),
      debug: nu.boolean().optional(),
      timeout: nu.number().optional(),
    });

    type ConfigType = Infer<typeof configSchema>;

    expectTypeOf<ConfigType>().toEqualTypeOf<{
      theme?: string | undefined;
      debug?: boolean | undefined;
      timeout?: number | undefined;
    }>();

    // Test with empty object
    const emptyConfig = configSchema.toZod().parse({});
    expect(emptyConfig).toEqual({});

    // Test with some fields
    const partialConfig = configSchema.toZod().parse({
      theme: "dark",
      debug: true,
    });

    expect(partialConfig).toEqual({
      theme: "dark",
      debug: true,
    });
  });

  // --- Nested Object Type Inference ---

  it("should infer nested object types correctly", () => {
    const profileSchema = nu.object({
      user: nu.object({
        id: nu.number(),
        name: nu.string(),
        email: nu.string().optional(),
      }),
      settings: nu
        .object({
          theme: nu.string(),
          notifications: nu.boolean().optional(),
        })
        .optional(),
    });

    type ProfileType = Infer<typeof profileSchema>;

    expectTypeOf<ProfileType>().toEqualTypeOf<{
      user: {
        id: number;
        name: string;
        email?: string | undefined;
      };
      settings?:
        | {
            theme: string;
            notifications?: boolean | undefined;
          }
        | undefined;
    }>();

    const profile = profileSchema.toZod().parse({
      user: {
        id: 1,
        name: "John",
        email: "john@example.com",
      },
      settings: {
        theme: "dark",
      },
    });

    expect(profile).toEqual({
      user: {
        id: 1,
        name: "John",
        email: "john@example.com",
      },
      settings: {
        theme: "dark",
      },
    });
  });

  // --- Complex Nested Structures ---

  it("should infer complex nested structures correctly", () => {
    const apiResponseSchema = nu.object({
      data: nu.array(
        nu.object({
          id: nu.number(),
          title: nu.string(),
          author: nu.object({
            name: nu.string(),
            bio: nu.string().optional(),
          }),
          tags: nu.array(nu.string()).optional(),
          metadata: nu
            .object({
              created: nu.string(),
              updated: nu.string().optional(),
            })
            .optional(),
        }),
      ),
      pagination: nu
        .object({
          page: nu.number(),
          total: nu.number(),
          hasNext: nu.boolean().optional(),
        })
        .optional(),
    });

    type ApiResponseType = Infer<typeof apiResponseSchema>;

    expectTypeOf<ApiResponseType>().toEqualTypeOf<{
      data: Array<{
        id: number;
        title: string;
        author: {
          name: string;
          bio?: string | undefined;
        };
        tags?: string[] | undefined;
        metadata?:
          | {
              created: string;
              updated?: string | undefined;
            }
          | undefined;
      }>;
      pagination?:
        | {
            page: number;
            total: number;
            hasNext?: boolean | undefined;
          }
        | undefined;
    }>();

    const response = apiResponseSchema.toZod().parse({
      data: [
        {
          id: 1,
          title: "Test Article",
          author: {
            name: "John Doe",
          },
          tags: ["tech", "programming"],
        },
      ],
    });

    expect(response.data).toHaveLength(1);
    expect(response.data[0].id).toBe(1);
    expect(response.data[0].author.name).toBe("John Doe");
  });

  // --- Partial Object Type Inference ---

  it("should infer partial object types correctly", () => {
    const userSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      email: nu.string(),
    });

    const partialUserSchema = userSchema.partial();
    type PartialUserType = Infer<typeof partialUserSchema>;

    expectTypeOf<PartialUserType>().toEqualTypeOf<{
      id?: number | undefined;
      name?: string | undefined;
      email?: string | undefined;
    }>();

    const partialUser = partialUserSchema.toZod().parse({
      name: "John",
    });

    expect(partialUser).toEqual({
      name: "John",
    });
  });

  // --- Omit/Extend Type Inference ---

  it("should infer omitted object types correctly", () => {
    const fullUserSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      email: nu.string(),
      password: nu.string(),
    });

    const publicUserSchema = fullUserSchema.omit("password");
    type PublicUserType = Infer<typeof publicUserSchema>;

    expectTypeOf<PublicUserType>().toEqualTypeOf<{
      id: number;
      name: string;
      email: string;
    }>();

    const publicUser = publicUserSchema.toZod().parse({
      id: 1,
      name: "John",
      email: "john@example.com",
    });

    expect(publicUser).toEqual({
      id: 1,
      name: "John",
      email: "john@example.com",
    });
  });

  it("should infer extended object types correctly", () => {
    const baseUserSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
    });

    const extendedUserSchema = baseUserSchema.extend({
      email: nu.string(),
      role: nu.string().optional(),
    });

    type ExtendedUserType = Infer<typeof extendedUserSchema>;

    expectTypeOf<ExtendedUserType>().toEqualTypeOf<{
      id: number;
      name: string;
      email: string;
      role?: string | undefined;
    }>();

    const extendedUser = extendedUserSchema.toZod().parse({
      id: 1,
      name: "John",
      email: "john@example.com",
    });

    expect(extendedUser).toEqual({
      id: 1,
      name: "John",
      email: "john@example.com",
    });
  });

  // --- Type Assignability Tests ---

  it("should enforce required field constraints at compile time", () => {
    const userSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      email: nu.string().optional(),
    });

    type UserType = Infer<typeof userSchema>;

    // This should compile fine - has all required fields
    const validUser: UserType = {
      id: 1,
      name: "John",
    };

    expect(validUser.id).toBe(1);
    expect(validUser.name).toBe("John");

    // This should also compile fine - has optional field
    const userWithEmail: UserType = {
      id: 1,
      name: "John",
      email: "john@example.com",
    };

    expect(userWithEmail.email).toBe("john@example.com");

    // These would be TypeScript compile errors if uncommented:
    // const invalidUser1: UserType = { id: 1 }; // Missing required 'name'
    // const invalidUser2: UserType = { name: "John" }; // Missing required 'id'
    // const invalidUser3: UserType = { id: "1", name: "John" }; // Wrong type for 'id'
  });

  it("should handle chained optional calls correctly", () => {
    // Ensure multiple .optional() calls don't break things
    const doubleOptionalSchema = nu.string().optional().optional();
    type DoubleOptionalType = Infer<typeof doubleOptionalSchema>;

    expectTypeOf<DoubleOptionalType>().toEqualTypeOf<string | undefined>();

    const parsed = doubleOptionalSchema.toZod().parse("hello");
    expect(parsed).toBe("hello");

    const parsedUndefined = doubleOptionalSchema.toZod().parse(undefined);
    expect(parsedUndefined).toBeUndefined();
  });
});
