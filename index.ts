import { Client, Message, ActivityType, EmbedBuilder, Guild, PermissionsBitField } from "discord.js"
import * as fs from "fs"
import * as ItemShopMethods from "./methods/ItemShop"
import * as DatabaseMethods from "./Database"
import * as HeistMethods from "./methods/Heists"
import Config from "./config"
import * as NPCMethods from "./methods/NPCs"
import Command from "./interfaces/Command"

export const Bot: Client = new Client({
    intents: [
        "GuildMessages",
        "MessageContent",
        "Guilds",
        "GuildMembers"
    ]
})

const Commands = new Array<Command>()
const token = Config.production ? Config.token : Config.testToken
const PermissionsRequired = [
    PermissionsBitField.Flags.ReadMessageHistory,
    PermissionsBitField.Flags.SendMessages,
    PermissionsBitField.Flags.AttachFiles
]

const SetStatus = () => {
    Bot.user?.setPresence({
        status: "online",
        activities: [
            {
                name: `${Bot.guilds.cache.size} servers | ${Config.prefix}help`,
                type: ActivityType.Watching
            }
        ]
    })
}

Bot.on("ready", async () => {
    console.log(`${Bot.user?.tag} is now online.`)
    SetStatus()

    await ItemShopMethods.InitializeUpdate()
    await HeistMethods.InitializeUpdate()

    const commands = fs.readdirSync("./commands")
    commands.forEach((c) => {
        const data: Command = require(`./commands/${c}`).default
        Commands.push(data)
    })
})

Bot.on("messageCreate", async (message: Message) => {
    message.content = message.content.toLowerCase()

    if (message.author.bot) return
    if (!message.content.startsWith(Config.prefix)) return
    if (!message.member) return
    if (!message.guild) return
    if (!Bot.user) return

    const guild = message.guild
    const me = guild.members.me

    if (!me) {
        console.log("BankingBot does not exist.")
        return
    }
    if (!me.permissions.has(PermissionsRequired)) {
        console.log("BankingBot does not have permissions.")
        return
    }

    const args = message.content.trim().split(/ +/g)
    const command: string = args[0].slice(Config.prefix.length).toLowerCase()

    const commandData = Commands.find((c) => c.Name == command || c.Aliases?.includes(command))
    if (!commandData) {
        message.channel.send(`Invalid command \`${command}\`. Please use \`${Config.prefix}help commands\` to view a list of commands.`)
        return
    }

    const userRecord = await DatabaseMethods.UserMethods.GetUserRecord(message.author.id)
    if (userRecord && userRecord.banned) {
        const bannedEmbed = new EmbedBuilder()
        bannedEmbed.setTitle("You're banned from using BankingBot")
        bannedEmbed.setDescription(`You have been banned from using BankingBot. If you think this is a mistake and would like to appeal, please join our [support server](${Config.permInvite}).`)
        bannedEmbed.setColor("Red")

        message.channel.send({
            embeds: [bannedEmbed]
        })
        return
    }

    await commandData.Invoke(Bot, message, args)
})

Bot.on("guildCreate", (guild: Guild) => {
    SetStatus()
})

Bot.on("guildDelete", () => {
    SetStatus()
})

Bot.login(token) 