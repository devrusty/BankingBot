import Command from "../interfaces/commandInterface";
import { Client, Message } from "discord.js"

const Cmd: Command = {
    Name: "debug",
    Description: "Debug commands that are only avaliable to the creator of BankingBot.",
    Usage: "`b!debug`",
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {

    }
}

export default Cmd