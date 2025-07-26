/**
 * Test Reporter Utility
 * Provides structured logging and state visibility for tests
 */

export class TestReporter {
  private events: Array<{
    timestamp: number;
    category: string;
    event: string;
    data?: any;
  }> = [];

  constructor(private testName: string) {}

  log(category: string, event: string, data?: any) {
    const entry = {
      timestamp: Date.now(),
      category,
      event,
      data,
    };

    this.events.push(entry);

    // Also output to console with structured format
    console.log(
      `[${category.toUpperCase()}] ${event}`,
      data ? JSON.stringify(data, null, 2) : "",
    );
  }

  getEvents() {
    return [...this.events];
  }

  getEventsByCategory(category: string) {
    return this.events.filter((e) => e.category === category);
  }

  summary() {
    console.log(`\n=== Test Report Summary: ${this.testName} ===`);

    const categories = [...new Set(this.events.map((e) => e.category))];

    for (const category of categories) {
      const categoryEvents = this.getEventsByCategory(category);
      console.log(
        `\n${category.toUpperCase()} (${categoryEvents.length} events):`,
      );

      for (const event of categoryEvents) {
        const timeStr =
          new Date(event.timestamp)
            .toISOString()
            .split("T")[1]
            ?.split(".")[0] || "00:00:00";
        console.log(
          `  ${timeStr} - ${event.event}${event.data ? `: ${JSON.stringify(event.data)}` : ""}`,
        );
      }
    }

    console.log(`\n=== End Test Report ===\n`);
  }
}

// Global test reporter instance - can be accessed from browser context
declare global {
  interface Window {
    testReporter?: TestReporter;
  }
}
