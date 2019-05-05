import {Command} from "./command";
import {CommandContext} from "../context/command_context";

import {Subscription} from "rxjs";
import {fromPromise} from "rxjs/internal-compatibility";
import {filter, flatMap, switchMap} from "rxjs/internal/operators";

import {Utils} from "../xiavpiclasses/utils";
import {MarketInformation} from "../xiavpiclasses/marketInformation";
import {Searchparams} from "../xiavpiclasses/searchparams";
import {Results} from "../xiavpiclasses/Results";
import {MarketHistory} from "../xiavpiclasses/marketHistory";

const XIVAPI = require('xivapi-js');

export class History extends Utils implements Command {

    readonly commandName = "history";
    xiv = new XIVAPI();
    server: string;
    itemName: string;
    subscription: Subscription;
    transactions: string[] = [];

    run(userCommand: CommandContext): void {
        if (userCommand.args && userCommand.args.length === 2) {

            this.itemName = this.getItemName(userCommand.args[0]);
            this.server = `${userCommand.args[1]}`;
            this.subscription = new Subscription();

            this.searchHistory(userCommand);

        } else {
            userCommand.message.channel.send("You need to tell me a item and a server first dummy!");
        }
    }

    private searchHistory(userCommand: CommandContext): void {

        this.subscription.add(fromPromise<Searchparams>(this.xiv.search(this.itemName))
            .pipe(
                flatMap((data: Searchparams) => data.Results),
                filter((result: Results) => result.UrlType === 'Item'),
                switchMap(result => fromPromise<MarketInformation>(this.xiv.market.get(result.ID, {
                    servers: this.server,
                    max_history: 10
                }))
                    .pipe(flatMap((market: MarketInformation) => market.History)))
            )
            .subscribe((history: MarketHistory) => this.processHistory(history),
                (error) => console.log(error),
                () => {
                    this.printValues(userCommand, this.transactions);
                    this.transactions = [];
                    this.subscription.unsubscribe();
                }));

    }

    private processHistory(history: MarketHistory): void {
        this.transactions.push(`${this.processDateDayMonth(parseInt(history.PurchaseDateMS))} - ` +
            `Sold ${history.Quantity}${history.IsHQ ? '(HQ)' : '(NQ)'} at ${this.currencyFormat(history.PricePerUnit)} per unit for a total of ${this.currencyFormat(history.PriceTotal)} gil`);
    }

    getHelp(commandPrefix: string): string {
        return "I need the name of the item with underlines and the name of a server. I will give you the last 10 transactions for that item on the server."
    }

}