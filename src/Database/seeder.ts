import better_sqlite3 from "better-sqlite3";

let db = new better_sqlite3("./src/Database/timezoneBot.db");

export class seeder {
  static async seedTimezones() {
    try {
      timeZones.forEach((timeZone) => {
        const sql = db.prepare(
          "INSERT INTO tz_zones (name, gmt, offset) VALUES (? , ?, ?)"
        );

        sql.run(timeZone.name, timeZone.GMT, timeZone.offset);
      });
    } catch (error) {
      throw error;
    }
  }
}

const timeZones = [
  {
    name: "GMT",
    GMT: "GMT+0",
    offset: 0,
  },
  {
    name: "ECT",
    GMT: "GMT+1:00",
    offset: 60,
  },
  {
    name: "EET",
    GMT: "GMT+2:00",
    offset: 120,
  },
  {
    name: "EAT",
    GMT: "GMT+3:00",
    offset: 180,
  },
  {
    name: "MET",
    GMT: "GMT+3:30",
    offset: 210,
  },
  {
    name: "NET",
    GMT: "GMT+4:00",
    offset: 240,
  },
  {
    name: "PLT",
    GMT: "GMT+5:00",
    offset: 300,
  },
  {
    name: "IST",
    GMT: "GMT+5:30",
    offset: 330,
  },
  {
    name: "BST",
    GMT: "GMT+6:00",
    offset: 360,
  },
  {
    name: "VST",
    GMT: "GMT+7:00",
    offset: 420,
  },
  {
    name: "CTT",
    GMT: "GMT+8:00",
    offset: 480,
  },
  {
    name: "JST",
    GMT: "GMT+9:00",
    offset: 540,
  },
  {
    name: "ACT",
    GMT: "GMT+9:30",
    offset: 570,
  },
  {
    name: "AET",
    GMT: "GMT+10:00",
    offset: 600,
  },
  {
    name: "SST",
    GMT: "GMT+11:00",
    offset: 660,
  },
  {
    name: "NST",
    GMT: "GMT+12:00",
    offset: 720,
  },
  {
    name: "MIT",
    GMT: "GMT-11:00",
    offset: -660,
  },
  {
    name: "HST",
    GMT: "GMT-10:00",
    offset: -600,
  },
  {
    name: "AST",
    GMT: "GMT-09:00",
    offset: -540,
  },
  {
    name: "PST",
    GMT: "GMT-08:00",
    offset: -480,
  },
  {
    name: "PNT",
    GMT: "GMT-07:00",
    offset: -420,
  },
  {
    name: "CST",
    GMT: "GMT-06:00",
    offset: -360,
  },
  {
    name: "EST",
    GMT: "GMT-05:00",
    offset: -300,
  },
  {
    name: "PRT",
    GMT: "GMT-04:00",
    offset: -240,
  },
  {
    name: "CNT",
    GMT: "GMT-03:30",
    offset: -210,
  },
  {
    name: "AGT",
    GMT: "GMT-03:00",
    offset: -180,
  },
  {
    name: "CAT",
    GMT: "GMT-01:00",
    offset: -60,
  },
];
