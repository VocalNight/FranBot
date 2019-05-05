import {Command} from "./command";
import {CommandContext} from "../context/command_context";

import {Subscription} from "rxjs";
import {fromPromise} from "rxjs/internal-compatibility";

import {Utils} from "../xiavpiclasses/utils";
import {Searchparams} from "../xiavpiclasses/searchparams";
import {filter, flatMap, switchMap, take} from "rxjs/internal/operators";
import {Results} from "../xiavpiclasses/Results";
import {MarketInformation} from "../xiavpiclasses/marketInformation";
import {MarketPrices} from "../xiavpiclasses/marketPrices";

const XIVAPI = require('xivapi-js');

export class MarketOffers extends Utils implements Command {

    readonly commandName = 'marketoffers';
    xiv = new XIVAPI();
    server: string;
    itemName: string;
    subscription: Subscription;
    listings: string[] = [];
    currentListings: number;

    run(userCommand: CommandContext): void {
        if (userCommand.args && userCommand.args.length === 2) {

            this.itemName = this.getItemName(userCommand.args[0]);
            this.server = `${userCommand.args[1]}`;
            this.subscription = new Subscription();

            this.searchMarket(userCommand);

        } else {
            userCommand.message.channel.send("You need to tell me a item and a server first dummy!");
        }
    }

    getHelp(commandPrefix: string): string {
        return "Returns the current 10 top prices for the item. And how many listings the item currently has in the server."
    }

    private searchMarket(userCommand: CommandContext): void {
        this.subscription.add(fromPromise<Searchparams>(this.xiv.search(this.itemName))
            .pipe(
                flatMap((data: Searchparams) => data.Results),
                filter((result: Results) => result.UrlType === 'Item'),
                switchMap(result => fromPromise<MarketInformation>(this.xiv.market.get(result.ID, {
                    servers: this.server,
                    max_history: 0
                }))
                    .pipe(
                        flatMap((market: MarketInformation) => {
                            this.currentListings = market.Prices.length;
                            return market.Prices;
                        }),
                        take(10)))
            )
            .subscribe((listings: MarketPrices) => this.processListings(listings),
                (error) => console.log(error),
                () => {
                    this.printValues(userCommand, this.listings);
                    this.listings = [];
                    this.subscription.unsubscribe();
                }));
    }

    private processListings(listings: MarketPrices): void {
        this.listings.push(`- ${listings.Quantity}${listings.IsHQ ? '(HQ)' : '(NQ)'} being sold at ${this.currencyFormat(listings.PricePerUnit)} per unit for a total of ${this.currencyFormat(listings.PriceTotal)} gil`);
    }
}