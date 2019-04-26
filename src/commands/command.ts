import { Message } from "discord.js";
import { CommandContext } from "../context/command_context";

export interface Command {

    readonly commandName: string;

    run(userCommand: CommandContext): void;
}