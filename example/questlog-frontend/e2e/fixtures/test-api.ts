import type { APIRequestContext } from "@playwright/test";

// Test user credentials - matches what test-utils.ts seeds
export const TEST_USER = {
  username: "testuser",
  password: "password123",
  email: "testuser@example.com",
};

// Test tenant for path-based multi-tenancy
export const TEST_TENANT = "tavern";

// Backend API base URL (no subdomain for path-based tenancy)
const API_BASE_URL = "http://localhost:4001";

export class TestAPI {
  constructor(private request: APIRequestContext) {}

  /**
   * Ensure the tenant exists before running tests
   */
  async ensureTenant() {
    const response = await this.request.post(
      `${API_BASE_URL}/api/test/ensure-tenant`,
      {
        data: {},
      },
    );

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Failed to ensure tenant: ${response.status()} - ${body}`,
      );
    }

    return response.json();
  }

  /**
   * Login as the test user and return cookies for authenticated requests
   */
  async login(
    username: string = TEST_USER.username,
    password: string = TEST_USER.password,
    tenant: string = TEST_TENANT,
  ) {
    const response = await this.request.post(`${API_BASE_URL}/auth/login`, {
      data: { username, password, tenant },
    });

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to login: ${response.status()} - ${body}`);
    }

    return response.json();
  }

  async clearDatabase() {
    const response = await this.request.post(
      `${API_BASE_URL}/api/test/clear-database`,
      {
        data: {},
      },
    );
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Failed to clear database: ${response.status()} - ${body}`,
      );
    }
    return response.json();
  }

  async seedTestData(data: {
    tickets?: Array<{ title: string; description?: string }>;
  }) {
    const response = await this.request.post(`${API_BASE_URL}/api/test/seed`, {
      data,
    });
    if (!response.ok()) {
      throw new Error(`Failed to seed test data: ${response.status()}`);
    }
    return response.json();
  }

  async getDatabaseStats() {
    const response = await this.request.get(`${API_BASE_URL}/api/test/stats`);
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Failed to get database stats: ${response.status()} - ${body}`,
      );
    }
    return response.json();
  }

  async getTicket(id: number) {
    const response = await this.request.get(`${API_BASE_URL}/tickets/${id}`);
    if (!response.ok()) {
      throw new Error(`Failed to get ticket: ${response.status()}`);
    }
    return response.json();
  }

  /**
   * Seed a user with multiple tenants for testing tenant selection flow
   */
  async seedMultiTenantUser(data: {
    username: string;
    password: string;
    email: string;
    tenants: Array<{ slug: string; name: string }>;
  }) {
    const response = await this.request.post(
      `${API_BASE_URL}/api/test/seed-multi-tenant-user`,
      {
        data,
      },
    );

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Failed to seed multi-tenant user: ${response.status()} - ${body}`,
      );
    }

    return response.json();
  }
}
