import Command from "../interfaces/commandInterface";
import { Client, Message } from "discord.js";
import * as DatabaseMethods from "..//databaseMethods"
import { EmbedBuilder } from "discord.js";

const Cmd: Command = {
    Name: "balance",
    Description: "Shows your balance if you have a BankingBot account initialised.",
    Usage: `b!balance`,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const recordExists: boolean = await DatabaseMethods.UserRecordExists(message.author)
        if (!recordExists) {
            message.channel.send("You do not have a BankingBot account! Please use `b!create` to initialise one.")
            return
        }

        const balance: number = await DatabaseMethods.GetUserBalance(message.author)
        const embed: EmbedBuilder = new EmbedBuilder()

        embed.setTitle(`${message.author.username}'s Balance`)
        embed.setColor("Red")
        embed.setThumbnail(message.author.displayAvatarURL())
        embed.setFields(
            { name: "Balance", value: `$${String(balance)}` }
        )

        message.channel.send({
            embeds: [embed]
        })
    }
}

export default Cmd