"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord = __importStar(require("discord.js"));
const db_1 = require("./db");
const config_json_1 = require("./config.json");
const client = new discord.Client();
client.on("ready", () => {
    var _a;
    console.log(`Ready as ${(_a = client === null || client === void 0 ? void 0 : client.user) === null || _a === void 0 ? void 0 : _a.username}`);
});
client.on("message", (msg) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // command detection
    if (!msg.content.startsWith(config_json_1.prefix) || msg.author.bot)
        return;
    const args = msg.content.slice(config_json_1.prefix.length).trim().split(/ +/);
    const command = (_a = args === null || args === void 0 ? void 0 : args.shift()) === null || _a === void 0 ? void 0 : _a.toLowerCase();
    msg.delete();
    if (command === "tz_ping") {
        // ping pong function
        yield msg.reply("pong");
    }
    else if (command === "tz_help") {
        // sends embeded card with the help menu
        const commandList = [
            { name: "!tz_ping", value: "Just a ping" },
            { name: "!tz_help", value: "Help menu :)" },
            {
                name: "!tz_convert <time> <AM/PM>",
                value: "Convert GMT+0 time to added timezones (add timezones with **!tz_add <timezone>**)",
            },
            { name: "!tz_add <timezone>", value: "Add a timezone to your list" },
            { name: "!tz_delete <timezone>", value: "Deletes selected timezone" },
            { name: "!tz_zones", value: "A list of all available timezones" },
            { name: "!tz_view", value: "A list of all **your** added timezones" },
        ];
        db_1.DB.makeEmbeded("Timezone bot commands", "Some commands for the bot", commandList, msg);
    }
    else if (command === "tz_zones") {
        // returns list of all available timezones (backup timezone list can be found in config.json)
        db_1.DB.tz_zones(msg);
    }
    else if (command === "tz_add") {
        // add zone to server
        db_1.DB.tz_add(msg, args[0]);
    }
    else if (command === "tz_view") {
        // return a list of all server spesific timezones
        db_1.DB.tz_view(msg);
    }
    else if (command === "tz_convert") {
        // function that converts givin time zone (in GMT+0) to server spesific timezones
        db_1.DB.tz_convert(msg, args[0], args[1]);
    }
    else if (command === "tz_delete") {
        // Deletes givin timezone
        db_1.DB.tz_delete(msg, args[0]);
    }
}));
client.login(config_json_1.token);
