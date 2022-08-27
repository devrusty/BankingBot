import { Client, Message, ActivityType, EmbedBuilder, Guild, PermissionsBitField } from "discord.js"
import * as fs from "fs"
import * as ItemShopMethods from "./methods/ItemShop"
import * as Config from "./config.json"
import * as DatabaseMethods from "./Database"

export const Bot: Client = new Client({
    intents: [
        "GuildMessages",
        "MessageContent",
        "Guilds",
        "GuildMembers"
    ]
})
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
                name: `${Bot.guilds.cache.size} servers`,
                type: ActivityType.Watching
            }
        ]
    })
}

Bot.on("ready", async () => {
    console.log(`${Bot.user?.tag} is now online.`)
    SetStatus()

    await ItemShopMethods.InitializeUpdate()
})

Bot.on("messageCreate", async (message: Message) => {
    message.content = message.content.toLowerCase()

    if (message.author.bot) return
    if (!message.content.startsWith(Config.prefix)) return
    if (!message.member) return
    if (!message.guild) return
    if (!Bot.user) return

    const roleName = Config.production ? Config.role : Config.testRole
    const role = message.guild.roles.cache.find((role) => role.name == roleName)
    if (!role) {
        console.log(`${roleName} role does not exist.`)
        return
    }
    if (!role.members.has(Bot.user.id)) {
        console.log("BankingBot is not added to the BankingBot role.")
        return
    }
    if (!role.permissions.has(PermissionsRequired)) {
        if (role.permissions.has(PermissionsBitField.Flags.SendMessages)) message.channel.send(`I need permissions \`READ_MESSAGE_HISTORY\` and \`ATTACH_FILES\`.`)
        console.log("BankingBot role does not have desired permissions.")
        return
    }

    const args = message.content.trim().split(/ +/g)
    const command: string = args[0].slice(Config.prefix.length).toLowerCase()

    const commandFilePath: string = `./commands/${command}.ts`
    if (!fs.existsSync(commandFilePath)) {
        message.channel.send(`Invalid command \`${command}\`. Please use \`b!help commands\` to view a list of commands.`)
        return
    }

    const userRecord = await DatabaseMethods.GetUserRecord(message.author.id)
    if (!userRecord || !userRecord.banned) {
        const invokeMethod = await require(commandFilePath).default.Invoke
        if (!invokeMethod) {
            message.channel.send("Invalid command.")
            return
        }
        await invokeMethod(Bot, message, args)
        return
    }

    const bannedEmbed = new EmbedBuilder()
    bannedEmbed.setTitle("You're banned from using BankingBot")
    bannedEmbed.setDescription("You have been banned from using BankingBot. If you think this is a mistake and would like to appeal, please join our [support server](https://discord.gg/Za5j3xvAzf).")
    bannedEmbed.setColor("Red")

    message.channel.send({
        embeds: [bannedEmbed]
    }).catch((err) => {
        console.log(err)
        return
    })
})

Bot.on("guildCreate", (guild: Guild) => {
    SetStatus()
})

Bot.on("guildDelete", () => {
    SetStatus()
})

Bot.login(token)