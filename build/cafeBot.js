"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("./config.json"));
const command_handler_1 = require("./command_handler");
const commandHandler = new command_handler_1.CommandHandler(config_json_1.default.prefix);
const client = new discord_js_1.Client();
client.on("ready", () => {
    console.log("I am ready!");
});
client.on("message", (message) => {
    commandHandler.handleMessage(message);
});
client.login(config_json_1.default.token);
//# sourceMappingURL=cafeBot.js.map