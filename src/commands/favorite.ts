import {Command} from "./command";
import {CommandContext} from "../context/command_context";
import * as mysql from "mysql";
import {Connection} from "mysql";

export class favorite implements Command{

    readonly commandName = 'favorite';
    connection: Connection;


    run(userCommand: CommandContext): void {
        if (userCommand.args && userCommand.args.length >= 1) {

            this.connection = mysql.createConnection({
                host: 'localhost',
                user: 'vocal',
                password: 'spider12',
                database: 'franBot'
            });

            switch (userCommand.args[1]) {

                case "list": {
                    break;
                }
                case "remove": {
                    break;
                }
                default:{
                    this.addToList(userCommand);
                    break;
                }
            }
        }
    }

    private addToList(userCommand: CommandContext): void {
        this.connection.connect();

        this.connection.query(`INSERT INTO favorites (user, itemname) VALUES (${userCommand.message.author.username}, ${userCommand.args[1]}`, function (error, results, fields) {
            if (error) throw error;
        });

    }


    getHelp(commandPrefix: string): string {
        return '';
    }


}