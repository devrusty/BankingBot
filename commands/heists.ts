import Command from "../interfaces/commandInterface";
import Config from "../config"
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../Database"
import * as MessageTemplates from "../methods/MessageTemplates"

interface SubCommandData {
    name: string
    invoke: Function
}

const SubCommands: SubCommandData[] = [
    {
        name: "index",
        invoke: async (client: Client, message: Message, args: string[]) => {
            const embed = new EmbedBuilder()
            embed.setTitle("Heists - Info")
            embed.setFields(
                { name: "List Heists", value: `\`${Config.prefix}heist list\``, inline: true },
                { name: `Joining a heist`, value: `\`${Config.prefix}heist join <heist>\``, inline: true }
            )
            embed.setColor(Config.embedColor)

            message.channel.send({
                embeds: [embed]
            })
        }
    },
    {
        name: "list",
        invoke: async (client: Client, message: Message, args: string[]) => {
            const heists = await DatabaseMethods.GetAvaliableHeists()
            const embed = new EmbedBuilder()

            embed.setTitle("Heists")
            embed.setDescription("Current avaliable heists.")
            embed.setColor(Config.embedColor)

            message.channel.send({
                embeds: [embed]
            })
        }
    }
]

const Cmd: Command = {
    Name: "heists",
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

        let subCmd = args[1]
        if (!subCmd) {
            await SubCommands[0].invoke(client, message, args)
            return
        }

        const cmd = SubCommands.find((command) => command.name == subCmd.toLowerCase())

        if (!cmd) {
            message.channel.send("Invalid subcommand.")
            return
        }

        await cmd.invoke(client, message, args)
    }
}

export default Cmd