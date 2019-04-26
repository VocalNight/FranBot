import { Client, Message } from 'discord.js';
import {default as config } from './config.json'


const client = new Client();

client.on("ready", () => {
    console.log("I am ready!");
});

client.on("message", (message: Message): void => {
    if (message.content.startsWith("ping")) {
        message.channel.send("pong!");
    }
});



client.login(config.token);