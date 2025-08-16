import type {
  InferRequestBody,
  InferRequestParams,
  InferResponseBody,
  ObjectSchema,
  RequestSchema,
} from "@nubase/core";
import { ClientNetworkError } from "../utils/network-errors";
import type {
  HttpClient,
  HttpRequestConfig,
  HttpResponse,
} from "./http-client";

type TypedMethodOptions<T extends RequestSchema> = {
  params?: InferRequestParams<T>;
  data?: InferRequestBody<T>;
  config?: HttpRequestConfig;
};

export type ErrorListener = (error: Error) => void;

// Helper type to create method signature based on HTTP method and request body
type MethodSignature<T extends RequestSchema> = T["method"] extends "GET"
  ? (
      options?: Omit<TypedMethodOptions<T>, "data">,
    ) => Promise<HttpResponse<InferResponseBody<T>>>
  : T["requestBody"] extends ObjectSchema
    ? (
        options?: TypedMethodOptions<T>,
      ) => Promise<HttpResponse<InferResponseBody<T>>>
    : (
        options?: Omit<TypedMethodOptions<T>, "data">,
      ) => Promise<HttpResponse<InferResponseBody<T>>>;

// Main typed API client structure - simple flat endpoints
type TypedApiMethods<T> = {
  [K in keyof T]: T[K] extends RequestSchema ? MethodSignature<T[K]> : never;
};

export class TypedApiClient<T> {
  private httpClient: HttpClient;
  private endpoints: T;
  private errorListener?: ErrorListener;

  constructor(
    httpClient: HttpClient,
    endpoints: T,
    errorListener?: ErrorListener,
  ) {
    this.httpClient = httpClient;
    this.endpoints = endpoints;
    this.errorListener = errorListener;

    // Create flattened API client structure
    this.createFlatApiClient();
  }

  private createFlatApiClient() {
    for (const [key, schema] of Object.entries(
      this.endpoints as Record<string, any>,
    )) {
      if (this.isRequestSchema(schema)) {
        (this as any)[key] = async (options: TypedMethodOptions<any> = {}) => {
          return this.executeRequest(schema as RequestSchema, options);
        };
      }
    }
  }

  private async executeRequest(
    schema: RequestSchema,
    options: TypedMethodOptions<any>,
  ): Promise<HttpResponse<any>> {
    try {
      const { params, data, config } = options;

      // Replace path parameters if they exist
      let path = schema.path;
      if (params && typeof params === "object") {
        for (const [key, value] of Object.entries(params)) {
          path = path.replace(`:${key}`, String(value));
        }
      }

      // Validate request body if provided
      if (data && schema.requestBody) {
        const result = schema.requestBody.toZod().safeParse(data);
        if (!result.success) {
          throw new ClientNetworkError(
            `Request validation failed for ${schema.method} ${path}`,
            {
              endpoint: path,
              method: schema.method,
              phase: "request-validation",
              zodError: result.error,
            },
          );
        }
      }

      // Make the HTTP request
      let response: HttpResponse<any>;
      switch (schema.method) {
        case "GET":
          response = await this.httpClient.get(path, config);
          break;
        case "POST":
          response = await this.httpClient.post(path, data, config);
          break;
        case "PUT":
          response = await this.httpClient.put(path, data, config);
          break;
        case "PATCH":
          response = await this.httpClient.patch(path, data, config);
          break;
        case "DELETE":
          response = await this.httpClient.delete(path, data, config);
          break;
        default:
          throw new Error(`Unsupported HTTP method: ${schema.method}`);
      }

      // Validate response body
      if (schema.responseBody && response.data !== undefined) {
        const result = schema.responseBody.toZod().safeParse(response.data);
        if (!result.success) {
          throw new ClientNetworkError(
            `Response validation failed for ${schema.method} ${path}`,
            {
              endpoint: path,
              method: schema.method,
              phase: "response-validation",
              zodError: result.error,
            },
          );
        }
        return {
          ...response,
          data: result.data,
        };
      }

      return response;
    } catch (error) {
      if (this.errorListener && error instanceof Error) {
        this.errorListener(error);
      }
      throw error;
    }
  }

  private isRequestSchema(obj: any): obj is RequestSchema {
    return (
      obj &&
      typeof obj === "object" &&
      "method" in obj &&
      "path" in obj &&
      "requestParams" in obj &&
      "responseBody" in obj
    );
  }
}

export function createTypedApiClient<T>(
  httpClient: HttpClient,
  endpoints: T,
  errorListener?: ErrorListener,
): TypedApiClient<T> & TypedApiMethods<T> {
  return new TypedApiClient(
    httpClient,
    endpoints,
    errorListener,
  ) as TypedApiClient<T> & TypedApiMethods<T>;
}
