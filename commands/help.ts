import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js"
import * as fs from "fs"

const GetCommandFields = () => {
    const commands = fs.readdirSync("./commands/").filter(file => file !== "help.ts")
    console.log(commands)
    return commands.map(command => {
        const data: Command = require(`./${command}`).default
        return {
            name: data.Name,
            value: data.Usage,
            inline: true
        }
    })
}

const Embeds = {
    index: new EmbedBuilder()
        .setTitle("BankingBot")
        .setDescription("BankingBot is a Discord bot that utilises economy commands, a item shop that updates daily, and ")
        .setColor("Red")
        .addFields(
            { name: "Commands", value: "`b!help commands`", inline: true },
            { name: "Earning", value: "`b!help earning`", inline: true },
            { name: "Credits", value: "`b!help credits`", inline: true }
        )
        .setFooter({
            text: "Created with Typescript, Prisma, PostgreSQL, and love by rust#7643"
        }),
    commands: new EmbedBuilder()
        .setTitle("BankingBot - Commands")
        .addFields(GetCommandFields())
        .setColor("Red")
}

const Cmd: Command = {
    Name: "help",
    Description: "Displays information about the bot.",
    Usage: "b!help <?section>",
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const helpSectioArgument = args[1]
        if (!helpSectioArgument || helpSectioArgument.toLowerCase() == "index") {
            message.channel.send({
                embeds: [Embeds.index]
            })
            return
        }

        const helpSection = (Embeds as any)[helpSectioArgument.toLowerCase()]
        if (!helpSection) {
            message.channel.send("Invalid help argument. Use `b!help` to view all help sections.")
            return
        }

        message.channel.send({
            embeds: [helpSection]
        })
    }
}

export default Cmd