import { Command } from "./command";
import { CommandContext } from "../context/command_context";

export class Help implements Command {

    readonly commandName = "franhelp";

    private commands: Command[];

    constructor(commands: Command[]) {
        this.commands = commands;
    }

    run(commandContext: CommandContext): void {

        if (commandContext.args.length == 0) {
            const commandNames = this.commands.map(command => command.commandName);
            commandContext.message.channel.send(
                `Here's the list of commands i have right now: \n ` + '```' + `${commandNames.join(", ")}` + '```' + ` \nUse !help 'name_of_the_command' to learn more about it.`
            );
            return;
        }

        const matchedCommand = this.commands.find(command => command.commandName.includes(commandContext.args[0]));
        if (!matchedCommand) {
            commandContext.message.channel.send("I don't recognize this command. Use !help to find all the ones i can use.");
            return;
        }

        commandContext.message.channel.send(this.buildHelpMessage(matchedCommand, commandContext));
        return;
    }

    private buildHelpMessage(command: Command, context: CommandContext): string {
        return `${command.getHelp(context.commandPrefix)}`;
    }

    getHelp(commandPrefix: string): string {
        return "Don't pretend you don't know what this does.";
    }
}