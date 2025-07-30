import type {
  InferRequestBody,
  InferRequestParams,
  InferResponseBody,
  RequestSchema,
} from "@nubase/core";
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

// Helper type to create method signature based on HTTP method
type MethodSignature<T extends RequestSchema> = T["method"] extends "GET"
  ? (
      options?: Omit<TypedMethodOptions<T>, "data">,
    ) => Promise<HttpResponse<InferResponseBody<T>>>
  : (
      options?: TypedMethodOptions<T>,
    ) => Promise<HttpResponse<InferResponseBody<T>>>;

// Main typed API client structure - simple flat endpoints
type TypedApiMethods<T> = {
  [K in keyof T]: T[K] extends RequestSchema ? MethodSignature<T[K]> : never;
};

export class TypedApiClient<T> {
  private httpClient: HttpClient;
  private endpoints: T;

  constructor(httpClient: HttpClient, endpoints: T) {
    this.httpClient = httpClient;
    this.endpoints = endpoints;

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
      try {
        schema.requestBody.parse(data);
      } catch (error) {
        throw new Error(`Request body validation failed: ${error}`);
      }
    }

    // Make the HTTP request
    switch (schema.method) {
      case "GET":
        return this.httpClient.get(path, config);
      case "POST":
        return this.httpClient.post(path, data, config);
      case "PUT":
        return this.httpClient.put(path, data, config);
      case "PATCH":
        return this.httpClient.patch(path, data, config);
      case "DELETE":
        return this.httpClient.delete(path, config);
      default:
        throw new Error(`Unsupported HTTP method: ${schema.method}`);
    }
  }

  private isRequestSchema(obj: any): obj is RequestSchema {
    return (
      obj &&
      typeof obj === "object" &&
      "method" in obj &&
      "path" in obj &&
      "requestParams" in obj &&
      "requestBody" in obj &&
      "responseBody" in obj
    );
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

export function createTypedApiClient<T>(
  httpClient: HttpClient,
  endpoints: T,
): TypedApiClient<T> & TypedApiMethods<T> {
  return new TypedApiClient(httpClient, endpoints) as TypedApiClient<T> &
    TypedApiMethods<T>;
}
