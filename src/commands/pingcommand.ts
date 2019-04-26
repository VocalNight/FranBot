import { Command } from "./command";
import { CommandContext } from "../context/command_context";

export class pingCommand implements Command {
    commandName = "ping";

    run(userCommand: CommandContext): void {
        userCommand.message.channel.send("pong");
    }
}