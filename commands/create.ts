import Command from "../interfaces/commandInterface";
import { Client, Message } from "discord.js";
import * as DatabaseMethods from "..//databaseMethods"

const Cmd: Command = {
    Name: "create",
    Description: "Initialises a BankingBot account if you don't already have one.",
    Usage: `${process.env.PREFIS}create`,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const recordExists: boolean = await DatabaseMethods.UserRecordExists(message.author)
        if (recordExists) {
            message.channel.send("You already have a BankingBot account. Use `b!balance` to view your balance.")
            return
        }

        const newRecord: boolean | void = await DatabaseMethods.CreateUserRecord(message.author)
        if (!newRecord) {
            message.channel.send("You already have a BankingBot account. Use `b!balance` to view your balance.")
            return
        }

        message.channel.send("Account created! Use `b!balance` to view your balance.")
        return
    }
}

export default Cmd