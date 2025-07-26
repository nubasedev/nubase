import { nu } from "./nu";

export const emptySchema = nu.object({});

export const idNumberSchema = nu.object({
  id: nu.number(),
});

export const idStringSchema = nu.object({
  id: nu.string(),
});

// Simple success response (e.g., for DELETE operations)
export const successSchema = nu.object({
  success: nu.boolean(),
});

// Success response with optional message
export const successMessageSchema = nu.object({
  success: nu.boolean(),
  message: nu.string().optional(),
});

// Success/error response with optional errors array
export const successErrorSchema = nu.object({
  success: nu.boolean(),
  message: nu.string().optional(),
  errors: nu
    .array(
      nu.object({
        field: nu.string().optional(),
        message: nu.string(),
      }),
    )
    .optional(),
});
