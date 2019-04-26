import {Command} from "./command";
import {CommandContext} from "../context/command_context";
import * as rx from 'rxjs';
import {map} from "rxjs/operators";

const XIVAPI = require('xivapi-js');


export class lowPriceCommand implements Command {

    commandName = "lowprice";
    subscription = new rx.Subscription();


    run(userCommand: CommandContext): void {
        if (userCommand.args && userCommand.args.length) {

            const itemName = `${userCommand.args[0]}`.replace("_", " ");

            const xiv = new XIVAPI();

            this.subscription.add(rx.from(xiv.search(itemName))
                .subscribe((data) => {
                    this.subscription.add(rx.from(xiv.market.get(data.Results[0].ID, {servers: `${userCommand.args[1]}`}))
                        .pipe(map((values) => {
                            return values.Prices[0].PricePerUnit
                        }))
                        .subscribe((price) => {
                            userCommand.message.channel.send(`The current lowest price for ${itemName} in ${userCommand.args[1]} is ${price} gil`);
                        }))
                }));
        } else {
            userCommand.message.channel.send("You need to tell me a item and a server first dummy!");
        }
    }
}