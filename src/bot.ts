import * as discord from "discord.js";

import { DB } from "./db";
import { utility } from "./utility";

import { token, prefix } from "./config.json";

const client = new discord.Client();

client.on("ready", () => {
  console.log(`Ready as ${client?.user?.username}`);
});

client.on("message", async (msg: discord.Message) => {
  // command detection
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = args?.shift()?.toLowerCase();

  msg.delete();

  if (command === "tz_ping") {
    // ping pong function
    await msg.reply("pong");
  } else if (command === "tz_help") {
    // sends embeded card with the help menu
    const commandList = [
      { name: "!tz_ping", value: "Just a ping" },
      { name: "!tz_help", value: "Help menu :)" },
      {
        name: "!tz_convert <time> <AM/PM>",
        value:
          "Convert GMT+0 time to added timezones (add timezones with **!tz_add <timezone>**)",
      },
      { name: "!tz_add <timezone>", value: "Add a timezone to your list" },
      { name: "!tz_delete <timezone>", value: "Deletes selected timezone" },
      { name: "!tz_zones", value: "A list of all available timezones" },
      { name: "!tz_view", value: "A list of all **your** added timezones" },
    ];

    utility.makeEmbeded(
      "Timezone bot commands",
      "Some commands for the bot",
      commandList,
      msg
    );
  } else if (command === "tz_zones") {
    // returns list of all available timezones (backup timezone list can be found in config.json)
    DB.tz_zones(msg);
  } else if (command === "tz_add") {
    // add zone to server
    DB.tz_add(msg, args[0]);
  } else if (command === "tz_view") {
    // return a list of all server spesific timezones
    DB.tz_view(msg);
  } else if (command === "tz_convert") {
    // function that converts givin time zone (in GMT+0) to server spesific timezones
    DB.tz_convert(msg, args[0], args[1]);
  } else if (command === "tz_delete") {
    // Deletes givin timezone
    DB.tz_delete(msg, args[0]);
  }
});

client.login(token);
