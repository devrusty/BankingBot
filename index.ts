import { Client, Message } from "discord.js"
import * as dotenv from "dotenv"
import * as fs from "fs"

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
    const command: string = args[0].slice("b!".length).toLowerCase()

    const commandFilePath: string = `./commands/${command}.ts`
    if (!fs.existsSync(commandFilePath)) {
        message.channel.send(`Invalid command \`${command}\`. Please use \`b!help\` to view a list of commands.`)
        return
    }

    await require(commandFilePath).default.Invoke(Bot, message, args)
})

Bot.login("MTAwMjY5ODg5MTUzNzQyNDM4NA.GQoqi1.QJkAaT1b75YIFd0hCqH54dTYPuV3nzN9luyNt4")