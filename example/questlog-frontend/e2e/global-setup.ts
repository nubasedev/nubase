import type { FullConfig } from "@playwright/test";

async function globalSetup(_config: FullConfig) {
  console.log("Running global setup...");

  // Wait for backend to be ready
  const maxRetries = 30;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const response = await fetch("http://localhost:4001/");
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

  // Clear database at the start of test run
  try {
    const response = await fetch(
      "http://localhost:4001/api/test/clear-database",
      {
        method: "POST",
      },
    );

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
