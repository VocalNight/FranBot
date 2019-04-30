import {Command} from "./command";
import {CommandContext} from "../context/command_context";
import {Utils} from "../xiavpiclasses/utils";

export class Servers extends Utils implements Command {

    readonly commandName = 'servers';
    servers: string[];

    run(userCommand: CommandContext): void {
        if (userCommand.args.length === 1) {

            this.servers = this.checkServers(userCommand, 0);
            if (this.servers.length > 1) {

                let message = '```' + this.servers.join(", ") + '```';
                userCommand.message.channel.send(message);
            } else {
                userCommand.message.channel.send("I need a datacenter name");
            }

        }
    }

    getHelp(commandPrefix: string): string {
        return "In case you forgot the servers in a datacenter";
    }

}