// src/tests/nu.test.ts

import { describe, it, expect, expectTypeOf } from 'vitest';
import { nu } from './nu';
import { toZod } from './toZod';
import { z } from 'zod';

describe('nubase Schema Library (nu)', () => {

  // --- Basic Schema Creation and Metadata ---
  it('should create a string schema with metadata', () => {
    const stringSchema = nu.string().meta({
      label: 'Username',
      description: 'The user\'s login name',
    })
    expect(stringSchema).toBeDefined();
    expect(stringSchema._meta.label).toBe('Username');
    expect(stringSchema._meta.description).toBe('The user\'s login name');
  });

  it('should create a number schema with metadata', () => {
    const numberSchema = nu.number().meta({
      label: 'Age',
    });
    expect(numberSchema).toBeDefined();
    expect(numberSchema._meta.label).toBe('Age');
  });

  it('should create an object schema with nested schemas and metadata', () => {
    const objectSchema = nu.object({
      id: nu.number(),
      name: nu.string().meta({
        label: 'Full Name',
      }),
      address: nu.object({
        street: nu.string(),
        city: nu.string(),
        zip: nu.string(),
      }).meta({
        label: 'Address',
        description: 'User\'s mailing address',
      }),
    }).meta({
      description: 'User Profile',
    });

    expect(objectSchema).toBeDefined();
    expect(objectSchema._shape.id).toBeDefined();
    expect(objectSchema._shape.name).toBeDefined();
    expect(objectSchema._shape.name._meta.label).toBe('Full Name');
    expect(objectSchema._meta.description).toBe('User Profile');
  });

  it('should create an array schema with an element schema', () => {
    const arraySchema = nu.array(nu.string().meta({ label: 'Item' })).meta({ label: 'List of Items' });
    expect(arraySchema).toBeDefined();
    expect(arraySchema._element).toBeDefined();
    expect(arraySchema._element._meta.label).toBe('Item');
    expect(arraySchema._meta.label).toBe('List of Items');
  });

  // --- Parse/Validation Tests ---
  it('should parse valid string data', () => {
    const stringSchema = nu.string();
    expect(stringSchema.parse('hello')).toBe('hello');
  });

  it('should throw error for invalid string data', () => {
    const stringSchema = nu.string();
    expect(() => stringSchema.parse(123)).toThrow('Expected string, received number');
  });

  it('should parse valid number data', () => {
    const numberSchema = nu.number();
    expect(numberSchema.parse(123)).toBe(123);
    expect(numberSchema.parse(123.45)).toBe(123.45);
  });

  it('should throw error for invalid number data', () => {
    const numberSchema = nu.number();
    expect(() => numberSchema.parse('abc')).toThrow('Expected number, received string');
    expect(() => numberSchema.parse(NaN)).toThrow('Expected number, received number'); // NaN is typeof number but not finite
    expect(() => numberSchema.parse(Infinity)).toThrow('Expected number, received number');
  });

  it('should parse valid object data', () => {
    const userSchema = nu.object({
      id: nu.number(),
      name: nu.string(),
      isActive: nu.boolean().meta({ label: 'Active', defaultValue: true }), // Only supported keys
    });
     // Note: Literal/boolean schemas aren't implemented, using parse here as a placeholder for demo.
     // A real implementation would have nu.boolean() and potentially nu.literal()

    const validData = { id: 1, name: 'Alice', isActive: true };
    expect(userSchema.parse(validData)).toEqual(validData);
  });


  it('should throw error for invalid object data (wrong type)', () => {
    const userSchema = nu.object({ id: nu.number(), name: nu.string() });
    expect(() => userSchema.parse(123)).toThrow('Expected object, received number');
    expect(() => userSchema.parse(null)).toThrow('Expected object, received object'); // typeof null is 'object'
  });

  it('should throw error for invalid object data (invalid property)', () => {
    const userSchema = nu.object({ id: nu.number(), name: nu.string() });
    const invalidData = { id: 'one', name: 'Alice' };
    expect(() => userSchema.parse(invalidData)).toThrow(/Object validation failed:\nProperty "id": Expected number, received string/);
  });

    // Note: Current ObjectSchema parse ignores extra keys. Add a test if you change that.
    it('should ignore extra keys in object data by default', () => {
        const userSchema = nu.object({ id: nu.number(), name: nu.string() });
        const dataWithExtra = { id: 1, name: 'Alice', age: 30 };
        const parsedData = userSchema.parse(dataWithExtra);
        expect(parsedData).toEqual({ id: 1, name: 'Alice' }); // Extra 'age' is ignored
    });


  it('should parse valid array data', () => {
    const stringArraySchema = nu.array(nu.string());
    const validData = ['a', 'b', 'c'];
    expect(stringArraySchema.parse(validData)).toEqual(validData);
  });

   it('should throw error for invalid array data (wrong type)', () => {
        const stringArraySchema = nu.array(nu.string());
        expect(() => stringArraySchema.parse('not an array')).toThrow('Expected array, received string');
    });

  it('should throw error for invalid array data (invalid element)', () => {
    const stringArraySchema = nu.array(nu.string());
    const invalidData = ['a', 123, 'c'];
    expect(() => stringArraySchema.parse(invalidData)).toThrow(/Array validation failed:\nElement at index 1: Expected string, received number/);
  });

  // --- toZod Conversion Tests ---

  it('should convert a string schema to a Zod string schema', () => {
    const nuString = nu.string();
    const zodString = toZod(nuString);
    expect(zodString instanceof z.ZodString).toBe(true);
    // Test Zod validation
    expect(zodString.parse('test')).toBe('test');
    expect(() => zodString.parse(123)).toThrow();
  });

  it('should convert a number schema to a Zod number schema', () => {
    const nuNumber = nu.number();
    const zodNumber = toZod(nuNumber);
    expect(zodNumber instanceof z.ZodNumber).toBe(true);
    // Test Zod validation
    expect(zodNumber.parse(123)).toBe(123);
    expect(() => zodNumber.parse('test')).toThrow();
  });

  it('should convert an object schema to a Zod object schema', () => {
    const nuObject = nu.object({
      name: nu.string(),
      age: nu.number().meta({ label: 'User Age' })
    });

    const zodObject = toZod(nuObject);

    expect(zodObject instanceof z.ZodObject).toBe(true);

    // Check the structure of the converted Zod schema
    expect(zodObject.shape.name instanceof z.ZodString).toBe(true);
    expect(zodObject.shape.age instanceof z.ZodNumber).toBe(true);

    // Test Zod validation
    const validData = { name: 'Bob', age: 42 };
    expect(zodObject.parse(validData)).toEqual(validData);
    expect(() => zodObject.parse({ name: 'Bob', age: 'old' })).toThrow();
  });

  it('should convert an array schema to a Zod array schema', () => {
    const nuArray = nu.array(nu.number());
    const zodArray = toZod(nuArray);
    expect(zodArray instanceof z.ZodArray).toBe(true);
    expect(zodArray.element instanceof z.ZodNumber).toBe(true);

    // Test Zod validation
    const validData = [1, 2, 3];
    expect(zodArray.parse(validData)).toEqual(validData);
    expect(() => zodArray.parse([1, 'two', 3])).toThrow();
  });

  it('should handle nested structures in toZod conversion', () => {
      const nestedNuSchema = nu.object({
          user: nu.object({
              name: nu.string(),
              address: nu.object({
                  street: nu.string(),
                  zip: nu.string()
              })
          }),
          tags: nu.array(nu.string())
      });

      const nestedZodSchema = toZod(nestedNuSchema);

      // Check types in the converted Zod schema structure
      expect(nestedZodSchema instanceof z.ZodObject).toBe(true);
      expect(nestedZodSchema.shape.user instanceof z.ZodObject).toBe(true);
      expect((nestedZodSchema.shape.user as z.ZodObject<any>).shape.name instanceof z.ZodString).toBe(true);
      expect((nestedZodSchema.shape.user as z.ZodObject<any>).shape.address instanceof z.ZodObject).toBe(true);
      expect(((nestedZodSchema.shape.user as z.ZodObject<any>).shape.address as z.ZodObject<any>).shape.street instanceof z.ZodString).toBe(true);
      expect(nestedZodSchema.shape.tags instanceof z.ZodArray).toBe(true);
      expect((nestedZodSchema.shape.tags as z.ZodArray<any>).element instanceof z.ZodString).toBe(true);


      // Test Zod validation with nested structure
      const validData = {
          user: {
              name: 'Charlie',
              address: { street: 'Main St', zip: '12345' }
          },
          tags: ['a', 'b']
      };
      expect(nestedZodSchema.parse(validData)).toEqual(validData);

      const invalidData = {
           user: {
              name: 'Charlie',
              address: { street: 123, zip: '12345' } // invalid street type
          },
          tags: ['a', 'b']
      };
      expect(() => nestedZodSchema.parse(invalidData)).toThrow();
  });


  // --- TypeScript Type Inference Tests ---

  it('should infer correct type for primitive schemas', () => {
    const s = nu.string();
    const n = nu.number();

    // Check inferred output type
    expectTypeOf(s).toHaveProperty('_outputType').toBeString();
    expectTypeOf(n).toHaveProperty('_outputType').toBeNumber();
  });

  it('should infer correct type for object schema', () => {
    const userSchema = nu.object({
      id: nu.number().meta({ label: 'User ID' }),
      name: nu.string(),
      settings: nu.object({
          theme: nu.string(),
          darkMode: nu.boolean().meta({ label: 'Switch' }) // Only supported keys
      })
    });

    // Check inferred output type structure
    expectTypeOf(userSchema).toHaveProperty('_outputType').toMatchTypeOf<{
        id: number;
        name: string;
        settings: {
            theme: string;
            darkMode: any; // Placeholder output type from .parse(true)
        }
    }>();

    // Test that assigning parsed data is type-safe
    const userData = { id: 1, name: 'Test', settings: { theme: 'dark', darkMode: false } };
    const parsedUser = userSchema.parse(userData);
    expectTypeOf(parsedUser).toMatchTypeOf<{ id: number; name: string; settings: { theme: string; darkMode: any; } }>();

    // This would be a TS error if types mismatched:
    // const badParsedUser: string = userSchema.parse(userData); // TS error expected
  });

  it('should infer correct type for array schema', () => {
    const numberArraySchema = nu.array(nu.number()); // Removed unsupported minValue metadata
    const stringArraySchema = nu.array(nu.string().meta({ label: 'Entry' }));
    const arrayOfObjectsSchema = nu.array(nu.object({ id: nu.number(), value: nu.string() }));


    // Check inferred output types
    expectTypeOf(numberArraySchema).toHaveProperty('_outputType').toBeArray();
    expectTypeOf(stringArraySchema).toHaveProperty('_outputType').toBeArray();
    expectTypeOf(arrayOfObjectsSchema).toHaveProperty('_outputType').toBeArray();


    // Test that assigning parsed data is type-safe
    const numberArrayData = [1, 2, 3];
    const parsedNumberArray = numberArraySchema.parse(numberArrayData);
    expectTypeOf(parsedNumberArray).toBeArray();
     // This would be a TS error:
    // const badParsedNumberArray: string[] = parsedNumberArray; // TS error expected
  });


    it('should infer correct Zod schema type after toZod conversion', () => {
        const nuString = nu.string().meta({ label: 'ID' });
        const zodString = toZod(nuString);
        expectTypeOf(zodString).toMatchTypeOf<z.ZodString>(); // Should be a ZodString
        expectTypeOf(zodString._output).toBeString(); // Should infer string output


        const nuObject = nu.object({
            name: nu.string(),
            age: nu.number()
        });
        const zodObject = toZod(nuObject);
        expectTypeOf(zodObject).toMatchTypeOf<z.ZodObject<any>>(); // Should be a ZodObject
         expectTypeOf(zodObject._output).toMatchTypeOf<{ name: string, age: number }>(); // Should infer the object type


        const nuArray = nu.array(nu.string());
        const zodArray = toZod(nuArray);
        expectTypeOf(zodArray).toMatchTypeOf<z.ZodArray<z.ZodString>>(); // Should be ZodArray of ZodString
        expectTypeOf(zodArray._output).toBeArray(); // Should infer string array type

        const nuNested = nu.object({
            items: nu.array(nu.object({
                id: nu.number()
            }))
        });
         const zodNested = toZod(nuNested);
         expectTypeOf(zodNested._output).toMatchTypeOf<{ items: Array<{ id: number }> }>(); // Should infer nested type
    });

});