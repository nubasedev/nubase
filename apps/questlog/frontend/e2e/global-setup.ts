import type { FullConfig } from "@playwright/test";

// Backend API base URL for the tavern workspace
const API_BASE_URL = "http://tavern.localhost:4001";

async function globalSetup(_config: FullConfig) {
  console.log("Running global setup...");

  // Wait for backend to be ready
  const maxRetries = 30;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (response.ok) {
        console.log("Backend is ready");
        break;
      }
    } catch (_error) {
      // Backend not ready yet
    }

    retries++;
    if (retries === maxRetries) {
      throw new Error("Backend failed to start within timeout");
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  // Ensure the workspace exists before running tests
  try {
    const response = await fetch(`${API_BASE_URL}/api/test/ensure-workspace`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      const data = await response.json();
      console.log(
        `Workspace ensured: ${data.workspace.name} (${data.workspace.slug})`,
      );
    } else {
      console.warn("Failed to ensure workspace:", response.status);
    }
  } catch (error) {
    console.warn("Could not ensure workspace:", error);
  }

  // Clear database at the start of test run
  try {
    const response = await fetch(`${API_BASE_URL}/api/test/clear-database`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });

    if (response.ok) {
      console.log("Test database cleared successfully");
    } else {
      console.warn("Failed to clear test database:", response.status);
    }
  } catch (error) {
    console.warn("Could not clear test database:", error);
  }
}

export default globalSetup;
