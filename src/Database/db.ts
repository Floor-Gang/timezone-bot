// dependencies
import Database from "better-sqlite3";
import Moment from "moment";

// TS classes/providers
import { utility } from "../Utilities/utility";
import { seeder } from "./seeder";
import "../Utilities/types";

let db = new Database("./src/Database/timezoneBot.db");

export class DB {
  // constructs database and fills table tz_zones when it's empty
  constructor() {
    const length_tz_zones: string = "SELECT COUNT(*) as 'Length' FROM tz_zones";
    const create_tz_zones: string =
      "CREATE TABLE IF NOT EXISTS tz_zones ( id INTEGER PRIMARY KEY AUTOINCREMENT , name CHAR NOT NULL , gmt CHAR NOT NULL , offset INT NOT NULL )";

    const create_server_zones: string =
      "CREATE TABLE IF NOT EXISTS server_zones ( id INTEGER PRIMARY KEY AUTOINCREMENT , server_ID BIGINT NOT NULL, zone_ID INT NOT NULL)";

    try {
      db.prepare(create_tz_zones).run();
      db.prepare(create_server_zones).run();

      const res: select_length_tz_zones = db.prepare(length_tz_zones).get();

      if (res.Length == 0) {
        seeder.seedTimezones();
      }
    } catch (error) {
      throw error;
    }
  }

  // returns list of all available timezones (backup timezone list can be found in config.json)
  public async tz_zones() {
    let zoneList: makeEmbeded[] = [];

    const sql: string = "SELECT * FROM tz_zones";

    try {
      const tz_zones: select_tz_zones[] = db.prepare(sql).all();

      tz_zones.forEach((zone: { name: string; gmt: string }) => {
        zoneList.push({
          name: zone.name,
          value: zone.gmt,
          inline: true,
        });
      });

      utility.makeEmbeded(
        "List of available timezones",
        "Add a timezone by using **!tz_add GMT**",
        zoneList
      );
    } catch (error) {
      throw error;
    }
  }

  // adds zone to server
  public async tz_add(zoneArray: string[]) {
    let zone_id: number;
    zoneArray.forEach((zoneName) => {
      const sql: string = "SELECT * FROM tz_zones WHERE name = ?";
      try {
        // Checks if zones exists in db
        const zone = db.prepare(sql).get(zoneName);

        if (zone) {
          // Checks if server already added zone
          zone_id = zone.id;

          const sql: string =
            "SELECT * FROM server_zones WHERE server_ID = ? AND zone_id = ?";

          const server_check = db.prepare(sql).get(global.server_id, zone_id);

          if (!server_check) {
            // Adds zone to server
            const sql: string =
              "INSERT INTO server_zones (server_ID, zone_ID) VALUES (?, ?)";

            db.prepare(sql).run(global.server_id, zone_id);

            utility.send("Added timezone");
          } else {
            utility.send("You've already added this timezone");
          }
        } else {
          utility.send("This timezone doesn't exist");
        }
      } catch (error) {
        throw error;
      }
    });
  }

  // returns a list of all dc server spesific timezones
  public async tz_view() {
    const sql: string =
      "SELECT * FROM server_zones INNER JOIN tz_zones on server_zones.zone_ID = tz_zones.id WHERE server_ID = ?";
    let embedMsg: makeEmbeded[] = [];

    try {
      const server_zones: select_server_tz_zones[] = db
        .prepare(sql)
        .all(global.server_id);

      server_zones.forEach((zone: { name: string; gmt: string }) => {
        embedMsg.push({
          name: zone.name,
          value: zone.gmt,
          inline: true,
        });
      });

      utility.makeEmbeded(
        "List of your timezones",
        "Remove a timezone by using **!tz_remove GMT**",
        embedMsg
      );
    } catch (error) {
      throw error;
    }
  }

  // converts givin time zone (in GMT+0) to server spesific timezones
  public async tz_convert(time: string, suffix: string) {
    const h12 = `${time} ${suffix}`;
    let cTime = utility.convert1224(h12);
    let fullMsg: string = `${time} ${suffix} in other timezones:\n`;

    try {
      if (cTime) {
        let date = Moment([2020, 7, 23, cTime[0], cTime[1]]).utcOffset(
          "2013-03-07T07:00:00+00:00",
          true
        );

        const sql: string = `SELECT * from server_zones INNER JOIN tz_zones on server_zones.zone_ID = tz_zones.id WHERE server_ID = ?`;

        const server_zones: select_server_tz_zones[] = db
          .prepare(sql)
          .all(global.server_id);

        if (server_zones.length > 0) {
          server_zones.forEach(
            (zone: { name: string; gmt: string; offset: number }) => {
              date.utcOffset(zone.offset);

              fullMsg += `${date.format("hh:mm a")} - ${zone.name}\n`;
            }
          );
          utility.send(fullMsg);
        } else {
          utility.send(
            "No timezones added, use **!tz_zones** for a list of all time zones and use **!tz_add <timezone>** to add timezones"
          );
        }
      }
    } catch (error) {
      throw error;
    }
  }

  // deletes givin timezone from dc server
  public async tz_delete(zoneArray: string[]) {
    zoneArray.forEach((zone) => {
      zone.toUpperCase();
      const sql: string = "SELECT id FROM tz_zones WHERE name = ?";
      const delete_sql =
        "DELETE FROM server_zones WHERE server_ID = ? AND zone_id = ?";

      try {
        const select_zone: select_tz_zones = db.prepare(sql).get(zone);

        db.prepare(delete_sql).run(global.server_id, select_zone.id);

        utility.send("Timezone deleted from your list");
      } catch (error) {
        throw error;
      }
    });
  }
}
