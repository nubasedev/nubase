import type { ZodError } from "zod";

export interface ParseErrorDetail {
  path: string;
  message: string;
  code: string;
  expected?: string;
  received?: string;
}

export interface NetworkErrorOptions {
  endpoint: string;
  method: string;
  statusCode?: number;
  responseText?: string;
}

/**
 * Base class for all network-related errors
 */
export abstract class NetworkError extends Error {
  public readonly endpoint: string;
  public readonly method: string;
  public readonly timestamp: Date;

  constructor(message: string, options: NetworkErrorOptions) {
    super(message);
    this.name = this.constructor.name;
    this.endpoint = options.endpoint;
    this.method = options.method;
    this.timestamp = new Date();

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Error thrown when client-side validation fails before making a network request
 */
export class ClientNetworkError extends NetworkError {
  // Custom inspect method for Node.js and some browser consoles
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON();
  }

  // For browsers that support console formatting
  get [Symbol.toStringTag]() {
    return JSON.stringify(this.toJSON(), null, 2);
  }
  public readonly phase:
    | "request-validation"
    | "response-validation"
    | "network-failure";
  public readonly parseErrors?: ParseErrorDetail[];
  public readonly originalError?: unknown;
  public readonly zodError?: ZodError;

  constructor(
    message: string,
    options: NetworkErrorOptions & {
      phase: "request-validation" | "response-validation" | "network-failure";
      parseErrors?: ParseErrorDetail[];
      originalError?: unknown;
      zodError?: ZodError;
    },
  ) {
    super(message, options);
    this.phase = options.phase;
    this.parseErrors = options.parseErrors;
    this.originalError = options.originalError;
    this.zodError = options.zodError;
  }

  toString(): string {
    const details = [];

    details.push(`${this.name}: ${this.message}`);
    details.push(`  Endpoint: ${this.method} ${this.endpoint}`);
    details.push(`  Phase: ${this.phase}`);
    details.push(`  Timestamp: ${this.timestamp.toISOString()}`);

    if (this.zodError) {
      details.push(`  Zod Error: ${this.zodError.toString()}`);
      if (this.zodError.issues.length > 0) {
        details.push("  Validation Issues:");
        this.zodError.issues.forEach((issue, index) => {
          const path = issue.path.length > 0 ? issue.path.join(".") : "root";
          details.push(
            `    ${index + 1}. Path: ${path}, Message: ${issue.message}, Code: ${issue.code}`,
          );
        });
      }
    }

    if (this.parseErrors && this.parseErrors.length > 0) {
      details.push("  Parse Errors:");
      this.parseErrors.forEach((error, index) => {
        details.push(
          `    ${index + 1}. Path: ${error.path}, Message: ${error.message}, Code: ${error.code}`,
        );
        if (error.expected) details.push(`       Expected: ${error.expected}`);
        if (error.received) details.push(`       Received: ${error.received}`);
      });
    }

    if (this.originalError) {
      const errorStr =
        this.originalError instanceof Error
          ? this.originalError.toString()
          : String(this.originalError);
      details.push(`  Original Error: ${errorStr}`);
    }

    return details.join("\n");
  }

  toJSON() {
    const result: any = {
      name: this.name,
      message: this.message,
      endpoint: this.endpoint,
      method: this.method,
      phase: this.phase,
      timestamp: this.timestamp.toISOString(),
    };

    if (this.zodError) {
      // Use the same beautiful format as ZodError
      result.zodError = this.zodError.issues;
    }

    if (this.parseErrors && this.parseErrors.length > 0) {
      result.parseErrors = this.parseErrors;
    }

    if (this.originalError) {
      result.originalError =
        this.originalError instanceof Error
          ? {
              name: this.originalError.name,
              message: this.originalError.message,
            }
          : this.originalError;
    }

    return result;
  }

  /**
   * Creates a ClientNetworkError for network failures (no response from server)
   */
  static fromNetworkFailure(
    error: unknown,
    options: NetworkErrorOptions,
  ): ClientNetworkError {
    const message =
      error instanceof Error
        ? `Network request failed for ${options.method} ${options.endpoint}: ${error.message}`
        : `Network request failed for ${options.method} ${options.endpoint}`;

    return new ClientNetworkError(message, {
      ...options,
      phase: "network-failure",
      originalError: error,
    });
  }
}

/**
 * Error thrown when the server returns an error response
 */
export class ServerNetworkError extends NetworkError {
  // Custom inspect method for Node.js and some browser consoles
  [Symbol.for("nodejs.util.inspect.custom")]() {
    return this.toJSON();
  }

  // For browsers that support console formatting
  get [Symbol.toStringTag]() {
    return JSON.stringify(this.toJSON(), null, 2);
  }
  public readonly statusCode: number;
  public readonly responseText?: string;
  public readonly responseData?: unknown;

  constructor(
    message: string,
    options: NetworkErrorOptions & {
      statusCode: number;
      responseText?: string;
      responseData?: unknown;
    },
  ) {
    super(message, options);
    this.statusCode = options.statusCode;
    this.responseText = options.responseText;
    this.responseData = options.responseData;
  }

  toString(): string {
    const details = [];

    details.push(`${this.name}: ${this.message}`);
    details.push(`  Endpoint: ${this.method} ${this.endpoint}`);
    details.push(`  Status Code: ${this.statusCode}`);
    details.push(`  Timestamp: ${this.timestamp.toISOString()}`);

    if (this.responseText) {
      details.push(`  Response Text: ${this.responseText}`);
    }

    if (this.responseData) {
      try {
        const dataStr =
          typeof this.responseData === "string"
            ? this.responseData
            : JSON.stringify(this.responseData, null, 2);
        details.push(`  Response Data: ${dataStr}`);
      } catch {
        details.push(`  Response Data: ${String(this.responseData)}`);
      }
    }

    return details.join("\n");
  }

  toJSON() {
    const result: any = {
      name: this.name,
      message: this.message,
      endpoint: this.endpoint,
      method: this.method,
      statusCode: this.statusCode,
      timestamp: this.timestamp.toISOString(),
    };

    if (this.responseText) {
      result.responseText = this.responseText;
    }

    if (this.responseData) {
      result.responseData = this.responseData;
    }

    return result;
  }

  /**
   * Creates a ServerNetworkError from an HTTP response
   */
  static fromResponse(
    response: Response,
    responseText?: string,
    responseData?: unknown,
  ): ServerNetworkError {
    const message = `Server error ${response.status} for ${response.url}: ${response.statusText}`;

    return new ServerNetworkError(message, {
      endpoint: response.url,
      method: "GET", // Will be overridden by caller with actual method
      statusCode: response.status,
      responseText,
      responseData,
    });
  }

  /**
   * Checks if this is a specific type of server error
   */
  isNotFound(): boolean {
    return this.statusCode === 404;
  }

  isUnauthorized(): boolean {
    return this.statusCode === 401;
  }

  isForbidden(): boolean {
    return this.statusCode === 403;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500;
  }
}

/**
 * Type guard to check if an error is a NetworkError
 */
export function isNetworkError(error: unknown): error is NetworkError {
  return error instanceof NetworkError;
}

/**
 * Type guard to check if an error is a ClientNetworkError
 */
export function isClientNetworkError(
  error: unknown,
): error is ClientNetworkError {
  return error instanceof ClientNetworkError;
}

/**
 * Type guard to check if an error is a ServerNetworkError
 */
export function isServerNetworkError(
  error: unknown,
): error is ServerNetworkError {
  return error instanceof ServerNetworkError;
}

/**
 * Helper to get a user-friendly error message
 */
export function getNetworkErrorMessage(error: unknown): string {
  if (isClientNetworkError(error)) {
    if (error.phase === "network-failure") {
      return "Unable to connect to the server. Please check your internet connection.";
    }
    if (error.zodError && error.zodError.issues.length > 0) {
      const firstIssue = error.zodError.issues[0];
      if (firstIssue) {
        return `Validation error: ${firstIssue.message}`;
      }
    }
    if (error.parseErrors && error.parseErrors.length > 0) {
      const firstError = error.parseErrors[0];
      if (firstError) {
        return `Validation error: ${firstError.message}`;
      }
    }
    return error.message;
  }

  if (isServerNetworkError(error)) {
    if (error.isNotFound()) {
      return "The requested resource was not found.";
    }
    if (error.isUnauthorized()) {
      return "You are not authorized to perform this action.";
    }
    if (error.isServerError()) {
      return "A server error occurred. Please try again later.";
    }
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "An unexpected error occurred.";
}
