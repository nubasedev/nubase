import type { APIRequestContext } from "@playwright/test";

// Test user credentials - matches what test-utils.ts seeds
export const TEST_USER = {
  email: "testuser@example.com",
  password: "password123",
  displayName: "Test User",
};

// Test workspace for path-based multi-workspace
export const TEST_WORKSPACE = "tavern";

// Backend API base URL (no subdomain for path-based tenancy)
const API_BASE_URL = "http://localhost:4001";

export class TestAPI {
  constructor(private request: APIRequestContext) {}

  /**
   * Ensure the workspace exists before running tests
   */
  async ensureWorkspace() {
    const response = await this.request.post(
      `${API_BASE_URL}/api/test/ensure-workspace`,
      {
        data: {},
      },
    );

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Failed to ensure workspace: ${response.status()} - ${body}`,
      );
    }

    return response.json();
  }

  /**
   * Login as the test user and return cookies for authenticated requests
   */
  async login(
    email: string = TEST_USER.email,
    password: string = TEST_USER.password,
    workspace: string = TEST_WORKSPACE,
  ) {
    const response = await this.request.post(`${API_BASE_URL}/auth/login`, {
      data: { email, password, workspace },
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
   * Seed a user with multiple workspaces for testing workspace selection flow
   */
  async seedMultiWorkspaceUser(data: {
    email: string;
    password: string;
    displayName: string;
    workspaces: Array<{ slug: string; name: string }>;
  }) {
    const response = await this.request.post(
      `${API_BASE_URL}/api/test/seed-multi-workspace-user`,
      {
        data,
      },
    );

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Failed to seed multi-workspace user: ${response.status()} - ${body}`,
      );
    }

    return response.json();
  }
}
