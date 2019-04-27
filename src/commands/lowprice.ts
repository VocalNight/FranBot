import {Command} from "./command";
import {CommandContext} from "../context/command_context";
import {default as servers} from '../config.json'

import {concatMap, filter, map, reduce, tap} from "rxjs/operators";
import {from, Observable, Subscription} from "rxjs";
import {Results} from "../xiavpiclasses/Results";
import {flatMap} from "rxjs/internal/operators";
import {fromArray} from "rxjs/internal/observable/fromArray";

import {Searchparams} from "../xiavpiclasses/searchparams";
import {MarketInformation} from "../xiavpiclasses/marketInformation";
import {MarketPrices} from "../xiavpiclasses/marketPrices";


const XIVAPI = require('xivapi-js');

export class Lowprice implements Command {

    readonly commandName = "lowprice";
    subscription: Subscription;
    servers$: Observable<any>;
    prices: string[] = [];
    searchHQ: boolean = false;


    run(userCommand: CommandContext): void {
        if (userCommand.args && userCommand.args.length) {

            const itemName = `${userCommand.args[0]}`.split('_').join(' ');

            this.searchHQ = userCommand.args[2] === 'hq';
            this.servers$ = fromArray(this.checkServers(userCommand));
            this.subscription = new Subscription();

            const xiv = new XIVAPI();

            this.subscription.add(this.servers$
                .pipe(concatMap(server => this.createObservable(xiv.search(itemName))
                    .pipe(
                        flatMap((data: Searchparams) => data.Results),
                        tap(result => console.log(result)),
                        filter((result: Results) => result.UrlType === 'Item'),
                        concatMap(result => this.createObservable(xiv.market.get(result.ID, {
                                servers: server,
                                max_history: 10
                            }))
                                .pipe(
                                    flatMap((market: MarketInformation) => market.Prices),
                                    filter((prices: MarketPrices) => this.searchHQ ? prices.IsHQ === true : prices.IsHQ === false),
                                    reduce((lowest: number, price: MarketPrices) => price.PricePerUnit < lowest ? price.PricePerUnit : lowest),
                                    map(price => ({price, server})))
                        ))))
                .subscribe((obj: { price: any, server: string }) => {

                        this.prices.push(`The lowest price for ${itemName}(${this.searchHQ ? 'HQ' : 'NQ'}) in ${obj.server} is ${obj.price.PricePerUnit} gil!`);

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
        return "I need the name of the item with underlines and the name of one or more servers. If you want to search for HQ items, add 'hq' to the end of the command. " +
            "I will then give you the lowest unit price of the NQ or HQ item in the server. Type your command like this:" +
            "\n ```!lowprice Crimson_Cider Ultros```" +
            "\n or ```!lowprice Crimson_Cider Ultros,Leviathan hq```";
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

    private checkServers(userCommand: CommandContext): string[] {
        let arrayServers: string[] = userCommand.args[1].split(',');

        if (arrayServers.length === 1) {

            switch (arrayServers[0]) {

                case "Aether": {
                    arrayServers = servers.Aether;
                    break;
                }
                case "Chaos": {
                    arrayServers = servers.Chaos;
                    break;
                }
                case "Elemental": {
                    arrayServers = servers.Elemental;
                    break;
                }
                case "Gaia": {
                    arrayServers = servers.Gaia;
                    break;
                }
                case "Mana": {
                    arrayServers = servers.Mana;
                    break;
                }
                case "Primal": {
                    arrayServers = servers.Primal;
                    break;
                }
                case "Crystal": {
                    arrayServers = servers.Crystal;
                    break;
                }
                case "Light": {
                    arrayServers = servers.Light;
                    break;
                }
            }
        }
        return arrayServers;
    }
}