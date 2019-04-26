import { Client, Message } from 'discord.js';
import {default as config } from './config.json'
import {CommandHandler} from "./command_handler";

const commandHandler = new CommandHandler(config.prefix);

const client = new Client();

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", (message: Message): void => {
    commandHandler.handleMessage(message);
});

client.login(config.token);