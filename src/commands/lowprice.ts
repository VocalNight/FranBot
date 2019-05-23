import {Command} from "./command";
import {CommandContext} from "../context/command_context";

import {filter, map, reduce, switchMap, take, tap} from "rxjs/operators";
import {Observable, Subscription, zip} from "rxjs";
import {Results} from "../xiavpiclasses/Results";
import {flatMap} from "rxjs/internal/operators";
import {fromArray} from "rxjs/internal/observable/fromArray";
import {fromPromise} from "rxjs/internal-compatibility";

import {Searchparams} from "../xiavpiclasses/searchparams";
import {MarketInformation} from "../xiavpiclasses/marketInformation";
import {MarketPrices} from "../xiavpiclasses/marketPrices";
import {Utils} from "../xiavpiclasses/utils";

const XIVAPI = require('xivapi-js');

// Get's the lowest price from a specific server or from multiple servers.
// You can also specify only the datacenter to get all the servers in that datacenter.

export class LowPrice extends Utils implements Command {

    readonly commandName = "lowprice";
    subscription: Subscription;
    servers$: Observable<any>;
    markets$: Observable<any>;
    prices: string[] = [];
    searchHQ: boolean;
    itemName: string;
    xiv = new XIVAPI();

    run(userCommand: CommandContext): void {
        if ((userCommand.args && userCommand.args.length) && userCommand.args[1] != null) {

            console.log(userCommand.args[1]);
            this.itemName = this.getItemName(userCommand.args[0]);
            this.searchHQ = userCommand.args[2] ? true : false;

            let serverArray = this.checkServers(userCommand, 1);
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
                            reduce((lowest: MarketPrices, price: MarketPrices) => price.PricePerUnit < lowest.PricePerUnit ? price : lowest),
                            map(price => ({price, server})))
                ))
            .subscribe((obj: { price: MarketPrices, server: string }) => {
                    this.pushToArray(obj);
                },
                (error) => console.log(error),
                () => {
                    this.printValues(userCommand, this.prices);
                    this.prices = [];
                    this.subscription.unsubscribe();
                }));
    }

    private searchMultipleServers(userCommand: CommandContext): void {

        this.subscription.add(fromPromise<Searchparams>(this.xiv.search(this.itemName))
            .pipe(
                flatMap((data: Searchparams) => data.Results),
                filter((result: Results) => result.UrlType === 'Item'),
                take(1),
                switchMap(item => fromPromise(this.xiv.market.get(item.ID, {
                    servers: this.checkServers(userCommand, 1),
                    max_history: 1
                })))
            )
            .subscribe((result) => {
                this.servers$ = fromArray(Object.keys(result));
                this.markets$ = fromArray(Object.values(result));
                this.joinServerPrices(userCommand);
            }));
    }

    private joinServerPrices(userCommand: CommandContext) {

        // Since the Object comes with the servers as keys,
        // i had to separate them from the body and use zip to add it to the correspondent price information

        this.subscription.add(
            zip(this.servers$, this.markets$
                .pipe(map((market: MarketInformation) => market.Prices)))
                .pipe(map(([server, prices]) => {
                    return ({server, prices})
                }))
                .subscribe(
                    (obj: { server: string, prices: MarketPrices[] }) => {
                        // Now that i have an object with the list of prices and the server, i can filter.
                        this.processPrices(obj);
                    }, (error) => (console.log(error)),
                    () => {
                        this.printValues(userCommand, this.prices);
                        this.prices = [];
                        this.subscription.unsubscribe();
                    }
                )
        );
    }

    // The old method was getting lost when not all servers had the price, it would result in the wrong servers having the price.
    // So i had to change to make sure that if the server dosn't have a listing, it never get's passed to the final response.
    private processPrices(market: { server: string, prices: MarketPrices[] }): void {

        const priceList: MarketPrices[] = market.prices.filter(price => this.searchHQ ? price.IsHQ : !price.IsHQ);
        if (priceList && priceList.length) {
            const lowestPrice = priceList.reduce((lowest: MarketPrices, price: MarketPrices) => {
                if (price.PricePerUnit < lowest.PricePerUnit) {
                    return price;
                } else {
                    return lowest;
                }
            });

            // I can only send the message to the chat when the observable completes,
            // so it's better to add everything to an array first and THEN print it
            this.pushToArray({server: market.server, price: lowestPrice});
        }
    }

    private pushToArray(obj: { server: string, price: MarketPrices }): void {
        this.prices.push(`The lowest price for ${this.itemName}(${this.searchHQ ? 'HQ' : 'NQ'}) in ${obj.server} is ${this.currencyFormat(obj.price.PricePerUnit)} gil!`);
    }

    getHelp(commandPrefix: string): string {
        return "I need the name of the item with underlines and the name of one or more servers." +
            "\nIf you want to search for HQ items, add 'hq' to the end of the command." +
            "\nAlternatively you can type the name of a datacenter with a capital letter (Primal, Aether, etc)." +
            "\nI will then give you the lowest unit price of the NQ or HQ item in the server/servers. Type your command like this:" +
            "\n```!lowprice Crimson_Cider Ultros,Leviathan```" +
            "\nor ```!lowprice Crimson_Cider Aether hq```";
    }
}