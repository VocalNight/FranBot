import { Message} from "discord.js";

// Extracts the command from the user message
export class CommandContext {

    readonly parsedCommand: string;

    //The arguments split by space
    readonly args: string[];

    readonly message: Message;

    readonly commandPrefix: string;

    constructor(message: Message, prefix: string) {
        this.commandPrefix = prefix;
        const splitMessage = message.content.slice(prefix.length).trim().split(/ +/g);
        console.log(splitMessage);

        this.parsedCommand = splitMessage.shift().toLowerCase();
        console.log(this.parsedCommand);
        this.args = splitMessage;
        this.message = message;
    }
}