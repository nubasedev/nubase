import { emitEvent } from "../events";
import type {
  CommandRegistry,
  NubaseContextData,
  TypedCommandDefinition,
} from "./types";

class CommandRegistryImpl implements CommandRegistry {
  private commands = new Map<string, TypedCommandDefinition<any>>();
  private context: NubaseContextData | null = null;

  setContext(context: NubaseContextData) {
    this.context = context;
  }

  register(command: TypedCommandDefinition<any>) {
    this.commands.set(command.id, command);
  }

  async execute(commandId: string, args?: unknown): Promise<void> {
    if (!this.context) {
      throw new Error(
        "Command context not set. Make sure to initialize the command system.",
      );
    }

    const command = this.commands.get(commandId);
    if (!command) {
      emitEvent("command.notFound", { commandId });
      return;
    }

    try {
      // Handle typed commands with optional schema validation
      if (command.argsSchema) {
        try {
          // Validate and parse arguments using the schema
          const validatedArgs = command.argsSchema.toZod().parse(args);
          await command.execute(this.context, validatedArgs);
        } catch (validationError) {
          console.error(
            `Invalid arguments for command "${commandId}":`,
            validationError,
          );

          // Show user-friendly error message
          const errorMessage =
            validationError instanceof Error &&
            "issues" in validationError &&
            Array.isArray((validationError as any).issues)
              ? `Invalid arguments for "${command.name}": ${(validationError as any).issues[0]?.message || "Unknown validation error"}`
              : `Invalid arguments for "${command.name}"`;

          emitEvent("command.invalidArgs", {
            commandId,
            commandName: command.name,
            error: errorMessage,
          });
          return;
        }
      } else {
        // Handle typed commands without schema
        await command.execute(this.context, args as any);
      }
    } catch (error) {
      console.error(`Error executing command "${commandId}":`, error);
    }
  }

  getCommand(commandId: string): TypedCommandDefinition<any> | undefined {
    return this.commands.get(commandId);
  }

  getAllCommands(): TypedCommandDefinition<any>[] {
    return Array.from(this.commands.values());
  }

  clear() {
    this.commands.clear();
  }
}

export const commandRegistry = new CommandRegistryImpl();
