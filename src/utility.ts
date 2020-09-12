import * as discord from "discord.js";

export class utility {
  // converts 12 hour time to 24 hour time
  static convert1224(time12h: any, msg: any) {
    const [time, modifier] = time12h.split(" ");

    let [hours, minutes] = time.split(":");

    if (hours > 12) {
      msg.channel.send("Invalid time");
      return false;
    } else {
      if (hours === "12") {
        hours = "00";
      }

      if (modifier === "PM") {
        hours = parseInt(hours, 10) + 12;
      }

      return [hours, minutes];
    }
  }

  // function that makes embeded messages
  static makeEmbeded(title: string, description: string, array: any, msg: any) {
    const embededMessage = new discord.MessageEmbed()
      .setColor("#F7044E")
      .setTitle(title)
      .setDescription(description)
      .addFields(array);

    msg.channel.send(embededMessage);
  }
}
