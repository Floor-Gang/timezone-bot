import * as discord from "discord.js";
import * as mysql from "mysql";
import Moment from "moment";

import "./providers";

const con = mysql.createConnection({
  host: "127.0.0.1",
  user: "root",
  password: "",
  database: "tz_bot",
});

let zone_id_global: number;

// class with functions to controll database
export class DB {
  // returns list of all available timezones (backup timezone list can be found in config.json)
  static tz_zones(msg: any) {
    let zoneList: any[] = [];

    const sql: string = "SELECT * FROM tz_zones";

    con.query(sql, (err: any, result: Array<provider_tz_zone>, fields: any) => {
      result.forEach((zone: { name: string; gmt: string }) => {
        zoneList.push({
          name: zone.name,
          value: zone.gmt,
          inline: true,
        });
      });

      DB.makeEmbeded(
        "List of available timezones",
        "Add a timezone by using **!tz_add GMT**",
        zoneList,
        msg
      );
    });
  }

  // add zone to server
  static tz_add(msg: any, zoneName: string) {
    const selectZoneSQL: string = `SELECT * FROM tz_zones WHERE name = '${zoneName}'`;

    con.query(
      selectZoneSQL,
      (err: any, result: Array<provider_tz_zone>, fields: any) => {
        // checks if zone exists
        if (result.length !== 0) {
          const testSQL: string = `SELECT * FROM server_zones WHERE server_ID = '${msg?.guild?.id}' AND zone_ID = '${result[0].id}'`;
          zone_id_global = result[0].id;
          con.query(testSQL, (err: any, result: any, fields: any) => {
            // checks if server has added the zone (0 = not added/ 1 = added)
            if (result.length == 0) {
              const addZoneSQL: string = `INSERT INTO server_zones (server_ID, zone_ID) VALUE ('${msg?.guild?.id}','${zone_id_global}')`;
              con.query(addZoneSQL, (err: any, result: any, fields: any) => {
                msg.channel.send("Added timezone");
              });
            } else {
              msg.channel.send("You've already added this timezone");
            }
          });
        } else {
          msg.channel.send("ERROR");
        }
      }
    );
  }

  // return a list of all server spesific timezones
  static tz_view(msg: any) {
    const serverZones: string = `SELECT * from server_zones INNER JOIN tz_zones on server_zones.zone_ID = tz_zones.id WHERE server_ID = ${msg?.guild?.id}`;
    let embedMsg: any[] = [];

    con.query(serverZones, (err: any, result: any, fields: any) => {
      result.forEach((zone: { name: string; gmt: string }) => {
        embedMsg.push({
          name: zone.name,
          value: zone.gmt,
          inline: true,
        });
      });

      DB.makeEmbeded(
        "List of your timezones",
        "Remove a timezone by using **!tz_remove GMT**",
        embedMsg,
        msg
      );
    });
  }

  // function that converts givin time zone (in GMT+0) to server spesific timezones
  static tz_convert(msg: any, time: string, suffix: string) {
    let fullMsg: string = "";

    const h12 = `${time} ${suffix}`;

    let convertedTime = DB.convert1224(h12, msg);

    if (convertedTime) {
      let date = Moment([
        2020,
        7,
        23,
        convertedTime[0],
        convertedTime[1],
      ]).utcOffset("2013-03-07T07:00:00+00:00", true);

      const serverZones: string = `SELECT * from server_zones INNER JOIN tz_zones on server_zones.zone_ID = tz_zones.id WHERE server_ID = ${msg?.guild?.id}`;

      con.query(serverZones, (err: any, result: any, fields: any) => {
        console.log(result);

        if (result.length == 0) {
          msg.channel.send(
            "No timezones added, use **!tz_zones** for a list of all time zones and use **!tz_add <timezone>** to add timezones"
          );
        } else {
          result.forEach((zone: { name: string; gmt: string; offset: any }) => {
            date.utcOffset(parseInt(zone.offset));

            fullMsg += `${date.format("hh:mm A")} ${zone.name}\n`;
          });

          msg.channel.send(fullMsg);
        }
      });
    }
  }

  // Deletes givin timezone
  static tz_delete(msg: any, zone: string) {
    const sql = `SELECT id FROM tz_zones WHERE name = '${zone}'`;

    con.query(sql, (err: any, result: any, fields: any) => {
      const sql = `DELETE FROM server_zones WHERE server_ID = ${msg?.guild?.id} AND zone_ID = ${result[0].id}`;

      con.query(sql, (err: any, result: any, fields: any) => {
        console.log(result);

        if (result.affectedRows != 0) {
          msg.channel.send("Delete timezone");
        } else {
          msg.channel.send("No timezones where deleted");
        }
      });
    });
  }

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
