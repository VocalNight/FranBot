import {Command} from "./commands/command";
import {pingCommand} from "./commands/pingcommand";
import {Message} from "discord.js";
import {CommandContext} from "./context/command_context";
import {lowPriceCommand} from "./commands/lowpricecommand";

export class CommandHandler {

    private commands: Command[];

    private readonly prefix: string;

    constructor(prefix: string) {
        const commandClasses = [pingCommand, lowPriceCommand];

        this.commands = commandClasses.map(commandClass => new commandClass());
        this.prefix = prefix;
    }

    handleMessage(message: Message): void {
        if (message.author.bot || !this.isCommand(message)) {
            return;
        }

        const commandContext = new CommandContext(message, this.prefix);

        const matchedCommand = this.commands.find(command => command.commandName.includes(commandContext.parsedCommand));

        if (!matchedCommand) {
            console.log(this.commands);
            console.log(commandContext);
            message.channel.send("I don't have this command, tehee");
        } else {
            matchedCommand.run(commandContext);
        }
    }


    /** Determines whether or not a message is a user command. */
    private isCommand(message: Message): boolean {
        return message.content.startsWith(this.prefix);
    }
}