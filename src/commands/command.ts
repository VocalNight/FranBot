import { CommandContext } from "../context/command_context";

export interface Command {

    readonly commandName: string;
    
    getHelp(commandPrefix: string): string;

    run(userCommand: CommandContext): void;
}