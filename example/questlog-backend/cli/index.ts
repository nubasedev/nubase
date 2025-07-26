import { Command, program } from "commander";
import { config } from "dotenv";
import { printError, printSuccess } from "./lib/console";
import { pgDump } from "./pg-dump/index";
import { pgDumpData } from "./pg-dump-data/index";

config({ path: ".env.development" });

// Save the original action method
const originalAction = Command.prototype.action;

// Override the action method with our timed version
Command.prototype.action = function (fn) {
  // Wrap the action function with timing logic
  const timedFn = async (...args: any[]) => {
    const commandName = this.name();
    const startTime = performance.now();

    try {
      // Call the original function
      return await fn(...args);
    } catch (error) {
      // Log the error but don't suppress it
      printError(
        `Command '${commandName}' failed: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error; // Re-throw to maintain original behavior
    } finally {
      const endTime = performance.now();
      const durationInSeconds = ((endTime - startTime) / 1000).toFixed(2);
      printSuccess(
        `Command '${commandName}' completed in ${durationInSeconds}s`,
      );
    }
  };

  // Call the original action method with our wrapped function
  return originalAction.call(this, timedFn);
};

program.command("pg-dump").action(async (_options: any) => {
  await pgDump();
});

program.command("pg-dump-data").action(async (_options: any) => {
  await pgDumpData();
});

program.parse();

export default null;
