import { Message } from "discord.js";

declare global {
  namespace NodeJS {
    interface Global {
      msg: Message;
      server_id: string | undefined;
    }
  }
}
