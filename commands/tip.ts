import Command from "../interfaces/commandInterface"
import { Client, Message, EmbedBuilder } from "discord.js"
import Config from "../config"

const Embeds = [
    new EmbedBuilder()
        .setDescription(`You can join the [official Discord server for BankingBot](${Config.permInvite})!`)
    ,
    new EmbedBuilder()
        .setDescription("BankingBot was officially released on August, 18, 2022.")
    ,
    new EmbedBuilder()
        .setDescription(`You can use \`${Config.prefix}mine\` every hour if you own a pickaxe.`)
    ,
    new EmbedBuilder()
        .setDescription("BankingBot v1.0 was independently developed in a span of over 2 weeks.")
    ,
    new EmbedBuilder()
        .setDescription("You shouldn't gamble all of your money at once.")
    ,
    new EmbedBuilder()
        .setDescription("The richest and most active server with BankingBot is [Natsu Floppa](https://discord.gg/wNMF4gSguD)")
    ,
    new EmbedBuilder()
        .setDescription("Heists are coming soon.")
    ,
    new EmbedBuilder()
        .setDescription("The verified checkmark is ONLY obtainable if you have BankingBot admin powers.")
]

const Cmd: Command = {
    Name: "tip",
    Description: "Sends a random tip about BankingBot.",
    Usage: `\`${Config.prefix}tip\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        Embeds.forEach((embed, index) => {
            embed.setTitle(`Tip #${index}`)
            embed.setColor(Config.embedColor)
            embed.setFooter({
                text: `Want another tip? Use \`${Config.prefix}tip\` again.`
            })
        })

        const index = Math.floor(Math.random() * Embeds.length)
        const embed = Embeds[index]

        message.channel.send({
            embeds: [embed]
        })
    }
}

export default Cmd