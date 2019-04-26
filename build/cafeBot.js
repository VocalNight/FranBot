"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const config_json_1 = __importDefault(require("./config.json"));
const client = new discord_js_1.Client();
client.on("ready", () => {
    console.log("I am ready!");
});
client.on("message", (message) => {
    if (message.content.startsWith("ping")) {
        message.channel.send("pong!");
    }
});
client.login(config_json_1.default.token);
//# sourceMappingURL=cafeBot.js.map