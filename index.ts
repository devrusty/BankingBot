import { Client, Message, ActivityType } from "discord.js"
import * as fs from "fs"
import * as ItemShopMethods from "./methods/ItemShop"
import * as Config from "./config.json"

const Bot: Client = new Client({
    intents: [
        "GuildMessages",
        "MessageContent",
        "Guilds",
        "GuildMembers"
    ]
})

const InitiateUpdateItemShop = async () => {
    await ItemShopMethods.UpdateItemShop()
    setTimeout(InitiateUpdateItemShop, 86400000)
}

const SetStatus = () => {
    Bot.user?.setPresence({
        status: "online",
        activities: [
            {
                name: `${Bot.guilds.cache.size} servers`,
                type: ActivityType.Watching
            }
        ]
    })
}

Bot.on("ready", async () => {
    console.log(`${Bot.user?.tag} is now online.`)
    SetStatus()

    await InitiateUpdateItemShop()
})

Bot.on("messageCreate", async (message: Message) => {
    message.content = message.content.toLowerCase()

    if (message.author.bot) return
    if (!message.content.startsWith(Config.prefix)) return
    if (!message.member) return

    const args = message.content.trim().split(/ +/g)
    const command: string = args[0].slice(Config.prefix.length).toLowerCase()

    const commandFilePath: string = `./commands/${command}.ts`
    if (!fs.existsSync(commandFilePath)) {
        message.channel.send(`Invalid command \`${command}\`. Please use \`b!help commands\` to view a list of commands.`)
        return
    }

    await require(commandFilePath).default.Invoke(Bot, message, args)
})

Bot.on("guildCreate", () => {
    SetStatus()
})

Bot.on("guildDelete", () => {
    SetStatus()
})

Bot.login(Config.token)