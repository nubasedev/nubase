import axios from "axios";

export interface HttpResponse<T = any> {
  status: number;
  data: T;
}

export interface HttpRequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
}

export class HttpClient {
  private baseUrl: string;

  constructor(baseUrl = "") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    url: string,
    method: string,
    data?: any,
    config: HttpRequestConfig = {},
  ): Promise<HttpResponse<T>> {
    const fullUrl = this.baseUrl ? `${this.baseUrl}${url}` : url;

    const response = await axios({
      url: fullUrl,
      method,
      data,
      headers: config.headers,
      timeout: config.timeout,
      params: config.params,
    });

    return {
      status: response.status,
      data: response.data,
    };
  }

  async get<T>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "GET", undefined, config);
  }

  async post<T>(
    url: string,
    data?: any,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "POST", data, config);
  }

  async put<T>(
    url: string,
    data?: any,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "PUT", data, config);
  }

  async patch<T>(
    url: string,
    data?: any,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "PATCH", data, config);
  }

  async delete<T>(
    url: string,
    config?: HttpRequestConfig,
  ): Promise<HttpResponse<T>> {
    return this.request<T>(url, "DELETE", undefined, config);
  }
}
