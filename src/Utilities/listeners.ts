import { utility } from "./utility";
import { DB } from "../Database/db";

let util = new utility();
let database = new DB();

export class listeners {
  public listen(command: string, _arguments: string[]) {
    _arguments.shift();
    switch (command) {
      case "tz help":
        util.helpMessage();
        break;
      case "tz zones":
        database.tz_zones();
        break;
      case "tz add":
        database.tz_add(_arguments);
        break;
      case "tz view":
        database.tz_view();
        break;
      case "tz convert":
        database.tz_convert(_arguments[0], _arguments[1]);
        break;
      case "tz delete":
        database.tz_delete(_arguments);
        break;
      case "tz ping":
        util.pong();
        break;
    }
  }
}
