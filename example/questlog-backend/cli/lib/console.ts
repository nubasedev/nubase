import chalk from "chalk";

// Helper function to get the current timestamp in 'YYYY-MM-DD HH:MM:SS' format
function getTimestamp(): string {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Base print function to include timestamp
function printWithTimestamp(
  colorFn: (msg: string) => string,
  symbol: string,
  ...args: any[]
) {
  const timestamp = chalk.cyan(`[${getTimestamp()}]`);

  // Format arguments similar to console.log
  const formattedArgs = args
    .map((arg) => {
      if (typeof arg === "string") {
        return arg;
      }
      if (typeof arg === "object" && arg !== null) {
        return JSON.stringify(arg, null, 2);
      }
      return String(arg);
    })
    .join(" ");

  // Conditionally add the symbol and space only if symbol is provided
  const message = symbol ? `${symbol} ${formattedArgs}` : formattedArgs;

  console.log(`${timestamp} ${colorFn(message)}`);
}

export function printLine(...args: any[]) {
  printWithTimestamp(chalk.yellow, "", ...args);
}

export function printError(...args: any[]) {
  printWithTimestamp(chalk.red, "❌", ...args);
}

export function printSuccess(...args: any[]) {
  printWithTimestamp(chalk.green, "✅", ...args);
}

export function printWarning(...args: any[]) {
  printWithTimestamp(chalk.magenta, "⚠️", ...args);
}

export function printDebug(...args: any[]) {
  printWithTimestamp(chalk.gray, "🐛", ...args);
}
