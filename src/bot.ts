import * as discord from "discord.js";

// import { DB } from "./db";
import { utility } from "./Utilities/utility";
import { DB } from "./Database/db";

let dbClass = new DB();

import { token, prefix } from "./config.json";

const client = new discord.Client();

client.on("ready", () => {
  console.log(`Ready as ${client?.user?.username}`);
});

client.on("message", async (msg: discord.Message) => {
  // command detection
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = `${args?.shift()?.toLowerCase()} ${args[0]}`;

  msg.delete();

  if (command === "tz ping") {
    // ping pong function
    await msg.reply("pong");
  } else if (command === "tz help") {
    // sends embeded card with the help menu
    const commandList = [
      { name: "!tz ping", value: "Just a ping" },
      { name: "!tz help", value: "Gets you this screen :)" },
      { name: "!tz zones", value: "A list of all available timezones" },
      { name: "!tz add <timezone>", value: "Add a timezone to your list" },
      {
        name: "!tz convert <time> <AM/PM>",
        value:
          "Convert GMT+0 time to added timezones (add timezones with **!tz_add <timezone>**)",
      },
      { name: "!tz delete <timezone>", value: "Deletes selected timezone" },
      { name: "!tz view", value: "A list of all **your** added timezones" },
    ];

    utility.makeEmbeded(
      "Timezone bot commands",
      "Some commands for the bot",
      commandList,
      msg
    );
  } else if (command === "tz zones") {
    // returns list of all available timezones (backup timezone list can be found in config.json)
    dbClass.tz_zones(msg);
  } else if (command === "tz add") {
    // add zone to server
    dbClass.tz_add(msg, args[1].toUpperCase());
  } else if (command === "tz view") {
    // return a list of all server spesific timezones
    dbClass.tz_view(msg);
  } else if (command === "tz convert") {
    // function that converts givin time zone (in GMT+0) to server spesific timezones
    dbClass.tz_convert(msg, args[1], args[2]);
  } else if (command === "tz delete") {
    // Deletes givin timezone
    dbClass.tz_delete(msg, args[1]);
  }
});

client.login(token);
