import Command from "../interfaces/commandInterface";
import Config from "../config.json"
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../Database"

const RecentlyUsed = new Set()
const Cooldown = 10000
const Results = ["Heads", "Tails"]
const Chance = Results.length
const Reward = 1000

const Cmd: Command = {
    Name: "flip",
    Description: "1 in 2 chance of winning $500.",
    Usage: `\`${Config.prefix}flip\``,
    Listed: true,
    Invoke: async (client: Client, message: Message) => {
        const author = message.author
        const record = await DatabaseMethods.GetUserRecord(author.id)
        if (!record) {
            message.channel.send(`You must have a BankingBot account initialised to use that command. Use \`${Config.prefix}account create\` to create one.`)
            return
        }

        if (RecentlyUsed.has(author.id)) {
            message.channel.send("You must wait 10 seconds before flipping again.")
            return
        }

        const index = Math.floor(Math.random() * Chance)
        const result = Results[index]

        const coinEmbed = new EmbedBuilder()
        coinEmbed.setTitle(result)
        coinEmbed.setDescription(`Your coin landed on ${result}!`)
        coinEmbed.setImage(`attachment://${result}.png`)
        if (result == "Heads") coinEmbed.setDescription(`Your coin landed on ${result} and you won $${Reward}!`)

        message.channel.send({
            files: [`./assets/images/coin/${result}.png` || ""],
            embeds: [coinEmbed]
        })

        RecentlyUsed.add(author.id)
        setTimeout(() => {
            RecentlyUsed.delete(author.id)
        }, Cooldown);

        if (result == "Tails") return

        await DatabaseMethods.AddToBalance(author.id, Reward)
    }
}

export default Cmd