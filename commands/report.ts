import Command from "../interfaces/commandInterface";
import Config from "../config.json"
import { Client, Message } from "discord.js"

const cmd: Command = {
    Name: "report",
    Description: "Allows you to report an issue or suggestion for BankingBot every hour. Abusing this command can lead to being banned from using BankingBot.",
    Usage: `${Config.prefix}report <msg>`,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {

    }
}

export default cmd