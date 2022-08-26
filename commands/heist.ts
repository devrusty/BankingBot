import Command from "../interfaces/commandInterface";
import Config from "../config.json"
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import * as MessageTemplates from "../methods/MessageTemplates"

const SubCommands = {
    index: async (client: Client, message: Message, args: string[]) => {
        const embed = new EmbedBuilder()
        embed.setTitle("Heists")
        embed.setFields(
            { name: "List Heists", value: `\`${Config.prefix}heist list\``, inline: true },
            { name: `Joining a heist`, value: `\`${Config.prefix}heist join <heist>\``, inline: true }
        )
        embed.setColor("Red")

        message.channel.send({
            embeds: [embed]
        })
    },
    list: async (client: Client, message: Message, args: string[]) => {

    }
}

const Cmd: Command = {
    Name: "heist",
    Description: "Heist and heist profile management.",
    Usage: `\`${Config.prefix}heist\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        if (Config.production) {
            message.channel.send("Forbidden.")
            return
        }

        const record = await DatabaseMethods.GetUserRecord(author.id)
        if (!record) {
            MessageTemplates.AssertAccountRequired(message)
            return
        }

        const subCmd = args[2]
        if (!subCmd) {
            await SubCommands.index(client, message, args)
            return
        }

        const command = (SubCommands as any)[subCmd]
        await command().catch(() => {
            message.channel.send("Invalid subcommand.")
        })
    }
}

export default Cmd