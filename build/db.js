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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const discord = __importStar(require("discord.js"));
const mysql = __importStar(require("mysql"));
const moment_1 = __importDefault(require("moment"));
require("./providers");
const con = mysql.createConnection({
    host: "127.0.0.1",
    user: "root",
    password: "",
    database: "tz_bot",
});
let zone_id_global;
// class with functions to controll database
class DB {
    // returns list of all available timezones (backup timezone list can be found in config.json)
    static tz_zones(msg) {
        let zoneList = [];
        const sql = "SELECT * FROM tz_zones";
        con.query(sql, (err, result, fields) => {
            result.forEach((zone) => {
                zoneList.push({
                    name: zone.name,
                    value: zone.gmt,
                    inline: true,
                });
            });
            DB.makeEmbeded("List of available timezones", "Add a timezone by using **!tz_add GMT**", zoneList, msg);
        });
    }
    // add zone to server
    static tz_add(msg, zoneName) {
        const selectZoneSQL = `SELECT * FROM tz_zones WHERE name = '${zoneName}'`;
        con.query(selectZoneSQL, (err, result, fields) => {
            var _a;
            // checks if zone exists
            if (result.length !== 0) {
                const testSQL = `SELECT * FROM server_zones WHERE server_ID = '${(_a = msg === null || msg === void 0 ? void 0 : msg.guild) === null || _a === void 0 ? void 0 : _a.id}' AND zone_ID = '${result[0].id}'`;
                zone_id_global = result[0].id;
                con.query(testSQL, (err, result, fields) => {
                    var _a;
                    // checks if server has added the zone (0 = not added/ 1 = added)
                    if (result.length == 0) {
                        const addZoneSQL = `INSERT INTO server_zones (server_ID, zone_ID) VALUE ('${(_a = msg === null || msg === void 0 ? void 0 : msg.guild) === null || _a === void 0 ? void 0 : _a.id}','${zone_id_global}')`;
                        con.query(addZoneSQL, (err, result, fields) => {
                            msg.channel.send("Added timezone");
                        });
                    }
                    else {
                        msg.channel.send("You've already added this timezone");
                    }
                });
            }
            else {
                msg.channel.send("ERROR");
            }
        });
    }
    // return a list of all server spesific timezones
    static tz_view(msg) {
        var _a;
        const serverZones = `SELECT * from server_zones INNER JOIN tz_zones on server_zones.zone_ID = tz_zones.id WHERE server_ID = ${(_a = msg === null || msg === void 0 ? void 0 : msg.guild) === null || _a === void 0 ? void 0 : _a.id}`;
        let embedMsg = [];
        con.query(serverZones, (err, result, fields) => {
            result.forEach((zone) => {
                embedMsg.push({
                    name: zone.name,
                    value: zone.gmt,
                    inline: true,
                });
            });
            DB.makeEmbeded("List of your timezones", "Remove a timezone by using **!tz_remove GMT**", embedMsg, msg);
        });
    }
    // function that converts givin time zone (in GMT+0) to server spesific timezones
    static tz_convert(msg, time, suffix) {
        var _a;
        let fullMsg = "";
        const h12 = `${time} ${suffix}`;
        let convertedTime = DB.convert1224(h12, msg);
        if (convertedTime) {
            let date = moment_1.default([
                2020,
                7,
                23,
                convertedTime[0],
                convertedTime[1],
            ]).utcOffset("2013-03-07T07:00:00+00:00", true);
            const serverZones = `SELECT * from server_zones INNER JOIN tz_zones on server_zones.zone_ID = tz_zones.id WHERE server_ID = ${(_a = msg === null || msg === void 0 ? void 0 : msg.guild) === null || _a === void 0 ? void 0 : _a.id}`;
            con.query(serverZones, (err, result, fields) => {
                console.log(result);
                if (result.length == 0) {
                    msg.channel.send("No timezones added, use **!tz_zones** for a list of all time zones and use **!tz_add <timezone>** to add timezones");
                }
                else {
                    result.forEach((zone) => {
                        date.utcOffset(parseInt(zone.offset));
                        fullMsg += `${date.format("hh:mm A")} ${zone.name}\n`;
                    });
                    msg.channel.send(fullMsg);
                }
            });
        }
    }
    // Deletes givin timezone
    static tz_delete(msg, zone) {
        const sql = `SELECT id FROM tz_zones WHERE name = '${zone}'`;
        con.query(sql, (err, result, fields) => {
            var _a;
            const sql = `DELETE FROM server_zones WHERE server_ID = ${(_a = msg === null || msg === void 0 ? void 0 : msg.guild) === null || _a === void 0 ? void 0 : _a.id} AND zone_ID = ${result[0].id}`;
            con.query(sql, (err, result, fields) => {
                console.log(result);
                if (result.affectedRows != 0) {
                    msg.channel.send("Delete timezone");
                }
                else {
                    msg.channel.send("No timezones where deleted");
                }
            });
        });
    }
    // converts 12 hour time to 24 hour time
    static convert1224(time12h, msg) {
        const [time, modifier] = time12h.split(" ");
        let [hours, minutes] = time.split(":");
        if (hours > 12) {
            msg.channel.send("Invalid time");
            return false;
        }
        else {
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
    static makeEmbeded(title, description, array, msg) {
        const embededMessage = new discord.MessageEmbed()
            .setColor("#F7044E")
            .setTitle(title)
            .setDescription(description)
            .addFields(array);
        msg.channel.send(embededMessage);
    }
}
exports.DB = DB;
