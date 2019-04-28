import {Command} from "./command";
import {CommandContext} from "../context/command_context";

export class Erp implements Command {
    readonly commandName = "erp";

    run(userCommand: CommandContext): void {
        userCommand.message.channel.send("https://pics.me.me/thumb_want-sum-fucc-niggy-waifu-just-texted-me-this-what-48414033.png");
    }

    getHelp(commandPrefix: string): string {
        return "OwO";
    }
}