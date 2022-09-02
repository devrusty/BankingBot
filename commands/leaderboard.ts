import Command from "../interfaces/commandInterface";
import { Client, EmbedBuilder, Message } from "discord.js"
import * as DatabaseMethods from "../Database"
import Config from "../config"
import FormatMoney from "../methods/FormatMoney";

const GetLeaderboard = async (message: Message) => {
    const records = await DatabaseMethods.GetUserCashLeaderboard()
    const members = message.guild?.members.cache
    const fields = records.map((record) => {
        const user = members?.find((u) => u.id == record.id)
        return { name: `${user?.user.tag || "Unknown"}`, value: `$${FormatMoney(record.cash)}` }
    })

    return fields
}

const Cmd: Command = {
    Name: "leaderboard",
    Description: "Displays the BankingBot leaderboard.",
    Usage: `\`${Config.prefix}leaderboard\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const fields = await GetLeaderboard(message)

        const embed = new EmbedBuilder()
        embed.setTitle("Leaderboard")
        embed.setFields(fields)
        embed.setColor(Config.embedColor)

        message.channel.send({
            embeds: [embed]
        })
    }
}

export default Cmd