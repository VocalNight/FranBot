import { Command } from "./command";
import { CommandContext } from "../context/command_context";

import { concatMap, filter, map, reduce } from "rxjs/operators";
import { from, Observable, Subscription } from "rxjs";
import { Results } from "../xiavpiclasses/Results";
import { flatMap } from "rxjs/internal/operators";
import { fromArray } from "rxjs/internal/observable/fromArray";

import { Searchparams } from "../xiavpiclasses/searchparams";
import { MarketInformation } from "../xiavpiclasses/marketInformation";
import { MarketPrices } from "../xiavpiclasses/marketPrices";


const XIVAPI = require('xivapi-js');

export class Lowprice implements Command {

    readonly commandName = "lowprice";
    subscription: Subscription;
    servers$: Observable<any>;
    prices: string[] = [];


    run(userCommand: CommandContext): void {
        if (userCommand.args && userCommand.args.length) {

            const itemName = `${userCommand.args[0]}`.replace("_", " ");
            const xiv = new XIVAPI();
            const arrayServers = userCommand.args[1].split(',');
            this.servers$ = fromArray(arrayServers);
            this.subscription = new Subscription();

            this.subscription.add(this.servers$
                .pipe(concatMap(server => this.createObservable(xiv.search(itemName))
                    .pipe(
                        flatMap((data: Searchparams) => data.Results),
                        filter((result: Results) => result.UrlType === 'Item'),
                        concatMap(result => this.createObservable(xiv.market.get(result.ID, {
                                servers: server,
                                max_history: 10
                            }))
                                .pipe(
                                    flatMap((market: MarketInformation) => market.Prices),
                                    reduce((lowest: number, price: MarketPrices) => price.PricePerUnit < lowest ? price.PricePerUnit : lowest),
                                    map(price => ({price, server})))
                        ))))
                .subscribe((obj: { price: any, server: string }) => {

                        this.prices.push(`The current lowest price for ${itemName} in ${obj.server} is ${obj.price.PricePerUnit} gil!`);

                    },
                    (error) => console.log(error),
                    () => {
                        this.printValues(userCommand);
                        this.subscription.unsubscribe();
                    }));
        } else {
            userCommand.message.channel.send("You need to tell me a item and a server first dummy!");
        }
    }

    getHelp(commandPrefix: string): string {
        return "I need the name of the item with underlines and the name of one or more servers. I will then give you the lowest unit price of the NQ item in the server. Type your command like this:" +
            "\n ```!lowprice Crimson_Cider Ultros```" +
            "\n or ```!lowprice Crimson_Cider Ultros,Leviathan```";
    }

    private createObservable(promise: Promise<any>): Observable<any> {
        return from(promise);
    }

    private printValues(userCommand: CommandContext): void {
        if (this.prices.length === 0) {
            userCommand.message.channel.send("The item is either not on the market, or you typed wrong.");
            return;
        }
        let message = '```' + this.prices.join("\n") + '```';
        userCommand.message.channel.send(message);
        this.prices = [];
    }
}