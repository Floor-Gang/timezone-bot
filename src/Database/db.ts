// dependencies
import * as sqlite3 from "sqlite3";
import Moment from "moment";
import * as discord from "discord.js";

// TS classes/providers
import { utility } from "../Utilities/utility";
import { seeder } from "./seeder";
import "../Utilities/types";

let db = new sqlite3.Database("./timezoneBot.db");

export class DB {
  // constructs database and fills table tz_zones when it's empty
  constructor() {
    const sql: string = "SELECT * FROM tz_zones";
    const create_tz_zones: string =
      "CREATE TABLE IF NOT EXISTS tz_zones ( id INTEGER PRIMARY KEY AUTOINCREMENT , name CHAR NOT NULL , gmt CHAR NOT NULL , offset INT NOT NULL )";

    const create_server_zones: string =
      "CREATE TABLE IF NOT EXISTS server_zones ( id INTEGER PRIMARY KEY AUTOINCREMENT , server_ID BIGINT NOT NULL, zone_ID INT NOT NULL)";

    try {
      db.run(create_tz_zones);
      db.run(create_server_zones);

      db.all(sql, [], (err: Error, rows: select_tz_zones[]) => {
        if (rows.length == 0) {
          seeder.seedTimezones();
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // returns list of all available timezones (backup timezone list can be found in config.json)
  public async tz_zones(msg: discord.Message) {
    let zoneList: makeEmbeded[] = [];

    const sql: string = "SELECT * FROM tz_zones";

    try {
      db.all(sql, [], (err: Error, rows: select_tz_zones[]) => {
        rows.forEach((zone: { name: string; gmt: string }) => {
          zoneList.push({
            name: zone.name,
            value: zone.gmt,
            inline: true,
          });
        });

        utility.makeEmbeded(
          "List of available timezones",
          "Add a timezone by using **!tz_add GMT**",
          zoneList,
          msg
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // adds zone to server
  public async tz_add(msg: discord.Message, zoneName: string) {
    let zone_id: number;
    let server_id: string | undefined = msg?.guild?.id;
    const sql: string = "SELECT * FROM tz_zones WHERE name = ?";

    try {
      db.get(sql, [zoneName], (err: Error, row: select_tz_zones) => {
        if (row) {
          zone_id = row.id;

          const sql: string =
            "SELECT * FROM server_zones WHERE server_ID = ? AND zone_id = ?";

          db.get(
            sql,
            [server_id, zone_id],
            (err: Error, row: select_server_zones) => {
              if (!row) {
                const sql: string =
                  "INSERT INTO server_zones (server_ID, zone_ID) VALUES (?, ?)";
                db.run(sql, [server_id, zone_id], () => {
                  msg.channel.send("Added timezone");
                });
              } else {
                msg.channel.send("You've already added this timezone");
              }
            }
          );
        } else {
          msg.channel.send("This timezone doesn't exist");
        }
      });
    } catch (error) {
      throw error;
    }
  }

  // returns a list of all dc server spesific timezones
  public async tz_view(msg: discord.Message) {
    const server_id: string | undefined = msg?.guild?.id;
    const sql: string =
      "SELECT * FROM server_zones INNER JOIN tz_zones on server_zones.zone_ID = tz_zones.id WHERE server_ID = ?";
    let embedMsg: makeEmbeded[] = [];

    try {
      db.all(sql, [server_id], (arr: Error, rows: select_server_tz_zones[]) => {
        rows.forEach((zone: { name: string; gmt: string }) => {
          embedMsg.push({
            name: zone.name,
            value: zone.gmt,
            inline: true,
          });
        });

        utility.makeEmbeded(
          "List of your timezones",
          "Remove a timezone by using **!tz_remove GMT**",
          embedMsg,
          msg
        );
      });
    } catch (error) {
      throw error;
    }
  }

  // converts givin time zone (in GMT+0) to server spesific timezones
  public async tz_convert(msg: discord.Message, time: string, suffix: string) {
    const server_id: string | undefined = msg?.guild?.id;
    const h12 = `${time} ${suffix}`;
    let cTime = utility.convert1224(h12, msg);
    let fullMsg: string = "";

    try {
      if (cTime) {
        let date = Moment([2020, 7, 23, cTime[0], cTime[1]]).utcOffset(
          "2013-03-07T07:00:00+00:00",
          true
        );

        const sql: string = `SELECT * from server_zones INNER JOIN tz_zones on server_zones.zone_ID = tz_zones.id WHERE server_ID = ?`;

        db.all(
          sql,
          [server_id],
          (err: Error, rows: select_server_tz_zones[]) => {
            if (rows.length == 0) {
              msg.channel.send(
                "No timezones added, use **!tz_zones** for a list of all time zones and use **!tz_add <timezone>** to add timezones"
              );
            } else {
              rows.forEach(
                (zone: { name: string; gmt: string; offset: number }) => {
                  date.utcOffset(zone.offset);

                  fullMsg += `${date.format("hh:mm a")} ${zone.name}\n`;
                }
              );

              msg.channel.send(fullMsg);
            }
          }
        );
      }
    } catch (error) {
      throw error;
    }
  }

  // deletes givin timezone from dc server
  public async tz_delete(msg: discord.Message, zone: string) {
    const server_id: string | undefined = msg?.guild?.id;
    const sql: string = "SELECT id FROM tz_zones WHERE name = ?";

    try {
      db.get(sql, [zone], (err: Error, row: select_tz_zones) => {
        const sql: string =
          "DELETE FROM server_zones WHERE server_ID = ? AND zone_id = ?";

        db.run(sql, [server_id, row.id], (err: Error) => {
          msg.channel.send("Timezone deleted from your list");
        });
      });
    } catch (error) {
      throw error;
    }
  }
}
