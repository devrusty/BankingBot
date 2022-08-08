import Command from "../interfaces/commandInterface";
import Config from "../config.json"
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import HorseRacingEmbed from "../classes/horseracing/HorseRacingEmbed";
import HorseColour from "../classes/horseracing/HorseColour";

const RecentlyUsed = new Set()
const Cmd: Command = {
    Name: "horserace",
    Description: "Allows you to bet on a horse",
    Usage: `\`${Config.prefix}horserace <color> <amount>\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const userRecord = await DatabaseMethods.GetUserRecord(author.id)

        if (!userRecord) {
            message.channel.send(`You must have a BankingBot account initialised to horse race! Use \`${Config.prefix}account create\`.`)
            return
        }

        let color = args[1]
        let amount = args[2]

        if (!color && !amount) {
            const helpEmbed = new EmbedBuilder()
            helpEmbed.setTitle("BankingBot Horse Racing")
            helpEmbed.setDescription("Horse racing is a form of gambling where you bet your money on a horse.")
            helpEmbed.setColor("Red")

            message.channel.send({
                embeds: [helpEmbed]
            })
            return
        }

        if (RecentlyUsed.has(author.id)) {
            message.channel.send("You must wait 10 minutes before you can horse race again.")
            return
        }

        if (!color) {
            message.channel.send("Please specify a color (Red, Blue, Orange, Yellow, Green)")
            return
        }

        if (!amount) {
            message.channel.send("Please specify an amount to bet. ($10,000+)")
            return
        }

        RecentlyUsed.add(author.id)

        const horseRacingEmbed = new HorseRacingEmbed(color, 5)
        horseRacingEmbed.Render()
    }
}

export default Cmd