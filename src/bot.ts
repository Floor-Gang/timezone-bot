// Imports
import * as discord from "discord.js";
import { listeners } from "./Utilities/listeners";
import { token, prefix } from "./config.json";

// Classes
const listener = new listeners();
const client = new discord.Client();

client.on("ready", () => {
  console.log(`Ready as ${client?.user?.username}`);
});

client.on("message", async (msg: discord.Message) => {
  global.msg = msg;
  global.server_id = msg?.guild?.id;
  // command detection
  if (!msg.content.startsWith(prefix) || msg.author.bot) return;

  const args = msg.content.slice(prefix.length).trim().split(/ +/);
  const command = `${args?.shift()?.toLowerCase()} ${args[0]}`;

  listener.listen(command, args);

});

client.login(token);
