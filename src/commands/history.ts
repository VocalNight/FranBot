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

            this.itemName = `${userCommand.args[0]}`.split('_').join(' ');
            this.server = `${userCommand.args[1]}`;
            this.subscription = new Subscription();

            this.searchHistory(userCommand);

        } else {
            userCommand.message.channel.send("You need to tell me a item and a server first dummy!");
        }
    }

    getHelp(commandPrefix: string): string {
        return "I need the name of the item with underlines and the name of a server. I will give you the last 10 transactions for that item on the server."
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
                    this.printValues(userCommand);
                    this.subscription.unsubscribe();
                }));

    }

    private processHistory(history: MarketHistory): void {
        let date = new Date(parseInt(history.PurchaseDateMS));
        this.transactions.push(`${("0" + date.getDate()).slice(-2) + '/' + ("0" + (date.getMonth() + 1)).slice(-2)} - ` +
            `Sold ${history.Quantity}${history.IsHQ ? '(HQ)' : ''} at ${this.currencyFormat(history.PricePerUnit)} per unit for a total of ${this.currencyFormat(history.PriceTotal)} gil`);
    }

    private printValues(userCommand: CommandContext): void {
        if (this.transactions.length === 0) {
            userCommand.message.channel.send("The item either was never sold, or you typed wrong.");
            return;
        }
        let message = '```' + this.transactions.join("\n") + '```';
        userCommand.message.channel.send(message);
        // Gotta reset it!
        this.transactions = [];
    }

}