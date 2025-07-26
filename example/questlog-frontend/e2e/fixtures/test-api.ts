import type { APIRequestContext } from "@playwright/test";

export class TestAPI {
  constructor(private request: APIRequestContext) {}

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
