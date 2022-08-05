import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js"
import * as fs from "fs"
import Config from "../config.json"

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
            { name: "💎 Premium", value: `\`${Config.prefix}!help premium\``, inline: true },
            { name: "🌐 Nexus", value: "[Invite BankingBot](https://discord.com/api/oauth2/authorize?client_id=1002698891537424384&permissions=68608&scope=bot) • [Support Server](https://discord.gg/Za5j3xvAzf) • [Website](https://www.google.com)" }
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
            { name: "Gambling", value: `You're able to gamble using \`${Config.prefix}gamble <amount>\` with a 1/4 chance of winning x1.25 the amount that you gambled.` },
            { name: "Begging", value: `You can use the \`${Config.prefix}beg\` every 2 minutes to get a random amount of money from 1 - 1,000.` },
            { name: "Lottery", value: `You can participate in the lottery using the \`${Config.prefix}lottery\` command. Lottery jackpots can range from 1 - 100,000,000.` },
            { name: "Daily Rewards", value: `You can claim your daily reward every 24 hours using the \`${Config.prefix}daily\` command.` },
            { name: "Jobs", value: `You can get a job by using \`${Config.prefix}jobs get <jobName>\`, and \`${Config.prefix}work\` every 2 hours.` }
        )
        .setFooter({
            text: "Created with Typescript, Prisma, PostgreSQL, and love by rust#7643"
        }),
    premium: new EmbedBuilder()
        .setTitle("BankingBot - Premium")
        .setColor("Red")
        .setDescription("BankingBot Premium gives you access to personal shops, 2x daily cash, premium role in the support server, +25% on gambling, and item shop leaks.")
        .addFields(
            { name: "Become a premium member", value: "[Link](https://www.google.com)" }
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
    Usage: `\`${Config.prefix}help <?section>\``,
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