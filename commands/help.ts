import Command from "../interfaces/Command";
import { Client, Message, EmbedBuilder } from "discord.js"
import * as fs from "fs"
import Config from "../config"
import { Bot } from "../index";
import FormatMoney from "../methods/FormatMoney";

let userCount = 0
let guilds = Bot.guilds.cache

guilds.forEach((guild) => userCount += guild.memberCount)

const GetCommandFields = () => {
    const commands = fs.readdirSync("./commands/").filter(command => command !== "help.ts")
    const commandFields = new Array()

    commands.forEach(command => {
        const data: Command = require(`./${command}`).default
        if (!data.Listed) return
        commandFields.push({
            name: data.Name,
            value: data.Usage,
            inline: true
        })
    })

    return commandFields
}

const Embeds = {
    index: new EmbedBuilder()
        .setTitle("BankingBot")
        .setDescription("BankingBot is a Discord bot that utilises economy commands, a item shop that updates daily, and many other features. (see `b!help commands`). Use `b!account create` to get started.")
        .setColor("Red")
        .addFields(
            { name: "💻 Commands", value: `\`${Config.prefix}help commands\``, inline: true },
            { name: "💵 Earning", value: `\`${Config.prefix}help earning\``, inline: true },
            { name: "💎 Premium", value: `\`${Config.prefix}help premium\``, inline: true },
            { name: "__Users__", value: `${FormatMoney(userCount)}`, inline: true },
            { name: "__Servers__", value: `${FormatMoney(guilds.size)}`, inline: true },
            { name: "__Release__", value: Config.release, inline: true },
            { name: "🌐 Nexus", value: `[Invite BankingBot](https://discord.com/api/oauth2/authorize?client_id=1002698891537424384&permissions=101376&scope=bot) • [@devrusty_](https://twitter.com/devrusty_) • [Discord Server](${Config.permInvite}) • [Upvote](https://discordbotlist.com/bots/bankingbot/upvote)` }
        )
        .setImage("attachment://HelpEmbedImage.png")
        .setFooter({
            text: "Created with Typescript, Prisma, PostgreSQL, and love by rust#7643"
        }),
    commands: new EmbedBuilder()
        .setTitle("BankingBot - Commands")
        .addFields(GetCommandFields())
        .setColor("Red")
        .setFooter({
            text: "Created with Typescript, Prisma, PostgreSQL, and love by rust#7643"
        }),
    earning: new EmbedBuilder()
        .setTitle("BankingBot - Earning")
        .setDescription("There are many ways to earn money inside of BankingBot. Here's a list of the recommended methods.")
        .setColor("Red")
        .addFields(
            { name: "Gambling", value: `You're able to gamble using \`${Config.prefix}gamble <amount>\` with a 1/4 chance of winning x1.25 (x1.50 for premium users) the amount that you gambled.` },
            { name: "Begging", value: `You can use the \`${Config.prefix}beg\` every 2 minutes to get a random amount of money from 1 - 1,000.` },
            { name: "Lottery", value: `You can participate in the lottery using the \`${Config.prefix}lottery\` command. Lottery jackpots can range from 1 - 100,000,000.` },
            { name: "Daily Rewards", value: `You can claim your daily reward every 24 hours using the \`${Config.prefix}daily\` command.` },
            { name: "Jobs", value: `You can get a job by using \`${Config.prefix}jobs get <jobName>\`, and \`${Config.prefix}jobs work\` every 2 hours.` }
        )
        .setFooter({
            text: "Created with Typescript, Prisma, PostgreSQL, and love by rust#7643"
        }),
    premium: new EmbedBuilder()
        .setTitle("BankingBot - Premium")
        .setColor("Red")
        .setDescription("BankingBot Premium gives you access to the following")
        .setFields(
            //{name: "🛒 Personal Shops", value: "Gives you access to your very own shops.", inline: true},
            { name: "💵 2x Daily Cash", value: "Doubles your daily reward!", inline: true },
            { name: "💎 Premium Role", value: "Gives you a premium role in the BankingBot support role", inline: true },
            { name: "🎲 x1.50 Gambling", value: "Multiplies gambling amount by x1.5", inline: true },
            { name: "🎒 Increased Inventory", value: "Inventory capacity is increased from 25 -> 100", inline: true },
            { name: "💸 Increased Donation Limit", value: "Donation limit is increased from $50,000 -> $100,000", inline: true },
            { name: "🔫 Immunity to being mugged", value: "Tired of being mugged? Premium users are immune to being mugged.", inline: true },
            { name: "Become a premium member", value: "[Link](https://ko-fi.com/s/d7a61f1814)", inline: false }
        )
}

const SendDefaultEmbed = (message: Message) => {
    message.channel.send({
        embeds: [Embeds.index],
        files: ["./assets/images/HelpEmbedImage.png"]
    })
}

const Cmd: Command = {
    Name: "help",
    Description: "Displays information about the bot.",
    Usage: `\`${Config.prefix}help\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const helpSectioArgument = args[1]
        if (!helpSectioArgument || helpSectioArgument.toLowerCase() == "index") {
            SendDefaultEmbed(message)
            return
        }

        const helpSection = (Embeds as any)[helpSectioArgument.toLowerCase()]
        if (!helpSection) {
            message.channel.send(`Invalid help argument. Use \`${Config.prefix}help\` to view all help sections.`)
            return
        }

        message.channel.send({
            embeds: [helpSection]
        })
    }
}

export default Cmd