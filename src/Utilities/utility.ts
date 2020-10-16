import * as discord from "discord.js";
import { prefix } from "../config.json";

export class utility {
  /* 
    Converts 12 hour time to 24 hour time
    @Params: {string} time12h 
    @Returns: {array} [hours, minutes] 
  */
  public static convert1224(time12h: string) {
    const [time, modifier] = time12h.split(" ");

    let [hours, minutes] = time.split(":");

    if (parseInt(hours) > 12) {
      global.msg.channel.send("Invalid time");
      return false;
    } else {
      if (hours === "12") {
        hours = "00";
      }

      if (modifier === "PM") {
        hours = (parseInt(hours) + 12).toString();
      }

      return [hours, minutes];
    }
  }

  /* 
    Function that sends the help embeded message to the discord chat
    @Params: nullß
    @Returns: null
  */
  public helpMessage() {
    const commandList = [
      { name: `${prefix}tz ping`, value: "Just a ping" },
      { name: `${prefix}tz help`, value: "Gets you this screen :)" },
      { name: `${prefix}tz zones`, value: "A list of all available timezones" },
      { name: `${prefix}tz add <timezone>`, value: "Add a timezone to your list" },
      {
        name: `${prefix}tz convert <time> <AM/PM>`,
        value:
          "Convert GMT+0 time to added timezones (add timezones with **!tz_add <timezone>**)",
      },
      { name: `${prefix}tz delete <timezone>`, value: "Deletes selected timezone" },
      { name: `${prefix}tz view`, value: "A list of all **your** added timezones" },
    ];

    utility.makeEmbeded(
      "Timezone bot commands",
      "Some commands for the bot",
      commandList
    );
  }

  /* 
    Function that makes and sends embeded messages
    @Params: {string} title, {string} description, {makeEmbeded[]} array
    @Returns: null
  */
  public static makeEmbeded(
    title: string,
    description: string,
    fieldsArray: makeEmbeded[]
  ) {
    const embededMessage = new discord.MessageEmbed()
      .setColor("#F7044E")
      .setTitle(title)
      .setDescription(description)
      .addFields(fieldsArray);

    global.msg.channel.send(embededMessage);
  }

  /* 
    Function that sends a message
    @Params: {string} message
    @Returns: null 
  */
  public static send(message: string) {
    global.msg.channel.send(message);
  }

  /* 
    PING PONG
    @Params: null
    @Returns: null 
  */
  public pong() {
    utility.send("pong");
  }
}
