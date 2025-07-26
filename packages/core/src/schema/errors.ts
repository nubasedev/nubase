/**
 * Represents a validation error in Nubase schema validation
 */
export interface NubaseValidationError {
  path: string;
  message: string;
  value?: unknown;
}

/**
 * Error thrown when Nubase schema validation fails
 */
export class NubaseSchemaError extends Error {
  public readonly errors: NubaseValidationError[];

  constructor(errors: NubaseValidationError[]) {
    const message = `Schema validation failed:\n${errors
      .map((e) => `  - ${e.path}: ${e.message}`)
      .join("\n")}`;

    super(message);
    this.name = "NubaseSchemaError";
    this.errors = errors;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  /**
   * Creates a NubaseSchemaError from a list of error messages
   */
  static fromMessages(errorMessages: string[]): NubaseSchemaError {
    const errors: NubaseValidationError[] = errorMessages.map((message) => {
      // Try to extract path from error message format "Property 'field': message"
      const match = message.match(/^Property '([^']+)':\s*(.+)$/);
      if (match?.[1] && match[2]) {
        return {
          path: match[1],
          message: match[2],
        };
      }
      // Fallback for messages without a clear path
      return {
        path: "root",
        message: message,
      };
    });

    return new NubaseSchemaError(errors);
  }

  /**
   * Type guard to check if an error is a NubaseSchemaError
   */
  static isNubaseSchemaError(error: unknown): error is NubaseSchemaError {
    return error instanceof NubaseSchemaError;
  }
}
