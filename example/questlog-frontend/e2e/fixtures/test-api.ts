import type { APIRequestContext } from "@playwright/test";

// Test user credentials - matches what test-utils.ts seeds
export const TEST_USER = {
  username: "testuser",
  password: "password123",
  email: "testuser@example.com",
};

export class TestAPI {
  constructor(private request: APIRequestContext) {}

  /**
   * Login as the test user and return cookies for authenticated requests
   */
  async login(
    username: string = TEST_USER.username,
    password: string = TEST_USER.password,
  ) {
    const response = await this.request.post(
      "http://localhost:4001/auth/login",
      {
        data: { username, password },
      },
    );

    if (!response.ok()) {
      const body = await response.text();
      throw new Error(`Failed to login: ${response.status()} - ${body}`);
    }

    return response.json();
  }

  async clearDatabase() {
    const response = await this.request.post(
      "http://localhost:4001/api/test/clear-database",
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
    const response = await this.request.post(
      "http://localhost:4001/api/test/seed",
      {
        data,
      },
    );
    if (!response.ok()) {
      throw new Error(`Failed to seed test data: ${response.status()}`);
    }
    return response.json();
  }

  async getDatabaseStats() {
    const response = await this.request.get(
      "http://localhost:4001/api/test/stats",
    );
    if (!response.ok()) {
      const body = await response.text();
      throw new Error(
        `Failed to get database stats: ${response.status()} - ${body}`,
      );
    }
    return response.json();
  }

  async getTicket(id: number) {
    const response = await this.request.get(
      `http://localhost:4001/tickets/${id}`,
    );
    if (!response.ok()) {
      throw new Error(`Failed to get ticket: ${response.status()}`);
    }
    return response.json();
  }
}
