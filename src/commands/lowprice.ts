import { Command } from "./command";
import { CommandContext } from "../context/command_context";

import { concatMap, filter, map, reduce, switchMap, tap } from "rxjs/operators";
import { from, Observable, Subscription, zip } from "rxjs";
import { Results } from "../xiavpiclasses/Results";
import { flatMap } from "rxjs/internal/operators";
import { fromArray } from "rxjs/internal/observable/fromArray";

import { Searchparams } from "../xiavpiclasses/searchparams";
import { MarketInformation } from "../xiavpiclasses/marketInformation";
import { MarketPrices } from "../xiavpiclasses/marketPrices";
import { Utils } from "../xiavpiclasses/utils";
import { fromPromise } from "rxjs/internal-compatibility";

const XIVAPI = require('xivapi-js');

// Get's the lowest price from a specific server or from multiple servers.
// You can also specify only the datacenter to get all the servers in that datacenter.

export class Lowprice extends Utils implements Command {

    readonly commandName = "lowprice";
    subscription: Subscription;
    servers$: Observable<any>;
    markets$: Observable<any>;
    prices: string[] = [];
    searchHQ: boolean;
    itemName: string;
    xiv = new XIVAPI();


    run(userCommand: CommandContext): void {
        if (userCommand.args && userCommand.args.length) {

            this.itemName = `${userCommand.args[0]}`.split('_').join(' ');
            this.searchHQ = userCommand.args[2] ? true : false;

            let serverArray = this.checkServers(userCommand);
            this.subscription = new Subscription();

            // If server array is still length 1, then only server was specified.
            if (serverArray.length === 1) {
                this.searchOneServer(userCommand, serverArray[0])
            } else {
                this.servers$ = fromArray(serverArray);
                this.searchMultipleServers(userCommand)
            }
        } else {
            userCommand.message.channel.send("You need to tell me a item and a server first dummy!");
        }
    }

    private searchOneServer(userCommand: CommandContext, server: string): void {

        this.subscription.add(fromPromise<Searchparams>(this.xiv.search(this.itemName))
            .pipe(
                // Get the ID from the item and then use it to search the information
                tap(data => console.log(data)),
                flatMap((data: Searchparams) => data.Results),
                filter((result: Results) => result.UrlType === 'Item'),
                switchMap(result => fromPromise<MarketInformation>(this.xiv.market.get(result.ID, {
                        servers: server,
                        max_history: 1
                    }))
                        .pipe(
                            // Get only the lowest price.
                            flatMap((market: MarketInformation) => market.Prices),
                            filter((prices: MarketPrices) => this.searchHQ ? prices.IsHQ : !prices.IsHQ),
                            reduce((lowest: number, price: MarketPrices) => price.PricePerUnit < lowest ? price.PricePerUnit : lowest),
                            map(price => ({price, server})))
                ))
            .subscribe((obj: { price: any, server: string }) => {
                    this.pushToArray(obj);
                },
                (error) => console.log(error),
                () => {
                    this.printValues(userCommand);
                    this.subscription.unsubscribe();
                }));
    }

    private searchMultipleServers(userCommand: CommandContext): void {

        this.subscription.add(fromPromise<Searchparams>(this.xiv.search(this.itemName))
            .pipe(
                flatMap((data: Searchparams) => data.Results),
                filter((result: Results) => result.UrlType === 'Item'),
                switchMap(item => fromPromise(this.xiv.market.get(item.ID, {
                    servers: this.checkServers(userCommand),
                    max_history: 1
                })))
            )
            .subscribe((result) => {
                this.servers$ = fromArray(Object.keys(result));
                this.markets$ = fromArray(Object.values(result));
                this.processPricesMultiple(userCommand);
            }));
    }

    private processPricesMultiple(userCommand: CommandContext) {

        // Since the Object comes with the servers as keys,
        // i had to separate them from the body and use zip to add it to the correspondent price information

        this.subscription.add(
            zip(this.servers$, this.markets$
                .pipe(
                    // Using concat to be ABSOLUTELY sure that the order is kept.
                    concatMap((market: MarketInformation) => fromArray(market.Prices)
                        .pipe(filter((prices: MarketPrices) => this.searchHQ ? prices.IsHQ : !prices.IsHQ),
                            reduce((lowest: number, price: MarketPrices) =>
                                price.PricePerUnit < lowest ? price.PricePerUnit : lowest)))
                ))
                .pipe(map(([server, price]) => {
                    return ({server, price})
                }))
                .subscribe(
                    (obj: { server: string, price: any }) => {
                        // I can only send the message to the chat when the observable completes,
                        // so it's better to add everything to an array first and THEN print it
                        this.pushToArray(obj);
                    }, (error) => (console.log(error)),
                    () => {
                        this.printValues(userCommand);
                        this.subscription.unsubscribe();
                    }
                )
        );
    }

    private printValues(userCommand: CommandContext): void {
        if (this.prices.length === 0) {
            userCommand.message.channel.send("The item is either not on the market, or you typed wrong.");
            return;
        }
        let message = '```' + this.prices.join("\n") + '```';
        userCommand.message.channel.send(message);
        // Gotta reset it!
        this.prices = [];
    }

    private pushToArray(obj: any): void {
        this.prices.push(`The lowest price for ${this.itemName}(${this.searchHQ ? 'HQ' : 'NQ'}) in ${obj.server} is ${this.currencyFormat(obj.price.PricePerUnit)} gil!`);
    }

    getHelp(commandPrefix: string): string {
        return "I need the name of the item with underlines and the name of one or more servers." +
            "\n If you want to search for HQ items, add 'hq' to the end of the command." +
            "\n Alternatively you can type the name of a datacenter with a capital letter (Primal, Aether, etc)." +
            "\n I will then give you the lowest unit price of the NQ or HQ item in the server/servers. Type your command like this:" +
            "\n ```!lowprice Crimson_Cider Ultros,Leviathan```" +
            "\n or ```!lowprice Crimson_Cider Aether hq```";
    }
}