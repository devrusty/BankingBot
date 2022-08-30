import Command from "../interfaces/commandInterface";
import Config from "../config"
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../Database"
import * as MessageTemplates from "../methods/MessageTemplates"
import FormatMoney from "../methods/FormatMoney"
import * as HeistMethods from "../methods/Heists"
import GlobalHeistData from "../cache/GlobalHeistData"
import HeistMeta from "../interfaces/HeistMeta"

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
                { name: "List Heists", value: `\`${Config.prefix}heists list\``, inline: true },
                { name: `Joining a heist`, value: `\`${Config.prefix}heists join <heist>\``, inline: true }
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
            const fields = heists.map((heist) => {
                const formatted = FormatMoney(heist.minPayout)
                const maxUsers = HeistMethods.GetHeistMaxUsersByDifficulty(heist.difficulty)
                return { name: heist.name, value: `Min-payout: $${formatted}\nLevel: ${heist.requiredLevel}\nDifficulty: ${heist.difficulty}\n${maxUsers}`, inline: true }
            })

            const embed = new EmbedBuilder()

            embed.setTitle("Heists")
            embed.setDescription(`Currently avaliable heists.`)
            embed.setColor(Config.embedColor)
            embed.setFields(fields)

            message.channel.send({
                embeds: [embed]
            })
        }
    },
    {
        name: "join",
        invoke: async (client: Client, message: Message, args: string[]) => {
            const author = message.author
            const record = await DatabaseMethods.GetUserRecord(author.id)
            if (!record) {
                MessageTemplates.AssertAccountRequired(message)
                return
            }

            const heistName = args.slice(2).join(" ")
            const heistData = await DatabaseMethods.GetHeistByName(heistName)

            if (!heistData) {
                message.channel.send("Invalid heist.")
                return
            }

            if (!heistData.avaliable) {
                message.channel.send(`Please choose a heist that is avaliable. (see \`${Config.prefix}heists list\`)`)
                return
            }

            const heist = HeistMethods.GetHeist(heistData.name)
            const userInHeist = HeistMethods.UserInHeist(author)
            if (!userInHeist) {
                message.channel.send(`You're already participating in a heist!`)
                return
            }

            if (!heist) {
                message.channel.send("Invalid heist.")
                return
            }

            if (heist.Users.includes(author)) {
                message.channel.send(`You're already apart of the ${heistData.name} heist!`)
                return
            }

            const maxUsers = HeistMethods.GetHeistMaxUsersByDifficulty(heistData.difficulty)
            if (heist.Users.length == maxUsers) {
                message.channel.send(`The heist you're trying to join has reached the maximum amount of users. (${heist.Users.length}/${maxUsers})`)
                return
            }
            /*
            await DatabaseMethods.AddUserToHeist(heistData.id, author.id).then(() => {
                message.channel.send(`You have successfully joined the ${heistData.name} heist!`)
            })
            */
        }
    },
    {
        name: "leave",
        invoke: async (client: Client, message: Message, args: string[]) => {
            const author = message.author
            const record = await DatabaseMethods.GetUserRecord(author.id)
            if (!record) {
                MessageTemplates.AssertAccountRequired(message)
                return
            }

            /*
            const userInHeist = await DatabaseMethods.UserInHeist(author.id)
            if (!userInHeist) {
                message.channel.send("You currently are not participating in a heist.")
                return
            }
            */

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
            message.channel.send(`Invalid subcommand \`${Config.prefix}heists ${subCmd}\``)
            return
        }

        await cmd.invoke(client, message, args)
    }
}

export default Cmd