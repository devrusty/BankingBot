import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "./databaseMethods"
import * as dotenv from "dotenv"

const Bot: Client = new Client({
    intents: [
        "GuildMessages",
        "MessageContent",
        "Guilds",
        "GuildMembers"
    ]
})

Bot.on("ready", () => {
    console.log(`${Bot.user?.tag} is now online.`)
})

Bot.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return
    if (!message.content.startsWith("b!")) return
    if (!message.member) return

    const args = message.content.trim().split(/ +/g)
    const command = args[0].slice("b!".length).toLowerCase()

    if (command == "create") {

    }

    if (command == "balance") {
        const recordExists: boolean = await DatabaseMethods.UserRecordExists(message.author)
        if (!recordExists) {
            message.channel.send("You do not have a BankingBot account! Please use `b!create` to initialise one.")
            return
        }

        const balance: number = await DatabaseMethods.GetUserBalance(message.author)
        const embed: EmbedBuilder = new EmbedBuilder()

        embed.setTitle(`${message.member.user.username}'s Balance`)
        embed.setThumbnail(message.member.user.displayAvatarURL())
        embed.setFields(
            { name: "Balance", value: String(balance) }
        )

        message.channel.send({
            embeds: [embed]
        })
    }
})

Bot.login(process.env.BOT_TOKEN)