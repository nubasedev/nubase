import type {
  CommandDefinition,
  CommandRegistry,
  NubaseContextData,
} from "./types";

class CommandRegistryImpl implements CommandRegistry {
  private commands = new Map<string, CommandDefinition>();
  private context: NubaseContextData | null = null;

  setContext(context: NubaseContextData) {
    this.context = context;
  }

  register(command: CommandDefinition) {
    this.commands.set(command.id, command);
  }

  async execute(
    commandId: string,
    args?: Record<string, unknown>,
  ): Promise<void> {
    if (!this.context) {
      throw new Error(
        "Command context not set. Make sure to initialize the command system.",
      );
    }

    const command = this.commands.get(commandId);
    if (!command) {
      console.warn(`Command "${commandId}" not found`);
      return;
    }

    try {
      await command.execute(this.context, args);
    } catch (error) {
      console.error(`Error executing command "${commandId}":`, error);
    }
  }

  getCommand(commandId: string): CommandDefinition | undefined {
    return this.commands.get(commandId);
  }

  getAllCommands(): CommandDefinition[] {
    return Array.from(this.commands.values());
  }

  clear() {
    this.commands.clear();
  }
}

export const commandRegistry = new CommandRegistryImpl();
