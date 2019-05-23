import { Command } from "./command";
import { CommandContext } from "../context/command_context";

export class Ping implements Command {
     readonly commandName = "ping";

    run(userCommand: CommandContext): void {
        userCommand.message.channel.send("pong");

    }

    getHelp(commandPrefix: string): string {
        return "I say pong back if i'm alive";
    }
}