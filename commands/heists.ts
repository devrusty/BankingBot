import Command from "../interfaces/Command";
import Config from "../config"
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../Database"
import * as MessageTemplates from "../methods/MessageTemplates"
import FormatMoney from "../methods/FormatMoney"
import * as HeistMethods from "../methods/Heists"
import { ItemType } from "@prisma/client";

interface SubCommandData {
    name: string
    invoke: Function
}

const SubCommands: SubCommandData[] = [
    {
        name: "index",
        invoke: async (client: Client, message: Message, args: string[]) => {
            const author = message.author
            const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
            if (!record) {
                MessageTemplates.AssertAccountRequired(message)
                return
            }

            let mask = await DatabaseMethods.ItemMethods.GetItemById(record.mask || 0)

            const embed = new EmbedBuilder()
            embed.setTitle("Heists - Info")
            embed.setFields(
                { name: "List Heists", value: `\`${Config.prefix}heists list\``, inline: true },
                { name: "Joining a heist", value: `\`${Config.prefix}heists join <heist>\``, inline: true },
                { name: "Equipping a mask", value: `\`${Config.prefix}heists setmask <maskName>\``, inline: true }
            )
            embed.setColor(Config.embedColor)

            if (mask) embed.setDescription(`Mask: ${mask.name}`)
            else embed.setDescription(`You do not have a mask equipped! Use \`${Config.prefix}heists setmask <maskName>\` to equip one.`)

            message.channel.send({
                embeds: [embed]
            })
        }
    },
    {
        name: "list",
        invoke: async (client: Client, message: Message, args: string[]) => {
            const heists = await DatabaseMethods.HeistMethods.GetAvaliableHeists()
            const fields = heists.map((heist) => {
                const formatted = FormatMoney(heist.minPayout)
                const maxUsers = HeistMethods.GetHeistMaxUsersByDifficulty(heist.difficulty)
                const heistData = HeistMethods.GetHeist(heist.name)
                return {
                    name: heist.name,
                    value: `Min-payout: $${formatted}\nLevel: ${heist.requiredLevel}\nDifficulty: ${heist.difficulty}\n${maxUsers}\n${heistData?.Users.size || 0}/${maxUsers}`,
                    inline: true
                }
            })

            const embed = new EmbedBuilder()

            embed.setTitle("Heists")
            embed.setDescription(`Current avaliable heists.`)
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
            const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
            if (!record) {
                MessageTemplates.AssertAccountRequired(message)
                return
            }

            const heistName = args.slice(2).join(" ")
            const heistData = await DatabaseMethods.HeistMethods.GetHeistByName(heistName)

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
            if (userInHeist) {
                message.channel.send(`You're already participating in a heist!`)
                return
            }

            if (!heist) {
                message.channel.send("The heist you're trying to join is not currently avaliable.")
                return
            }

            if (heist.Users.has(author)) {
                message.channel.send(`You're already apart of the ${heistData.name} heist!`)
                return
            }

            const maxUsers = HeistMethods.GetHeistMaxUsersByDifficulty(heistData.difficulty)
            if (heist.Users.size == maxUsers) {
                message.channel.send(`The heist you're trying to join has reached the maximum amount of users. (${heist.Users.size}/${maxUsers})`)
                return
            }

            await HeistMethods.JoinHeist(author, heistData.name).then(() => {
                message.channel.send(`You have successfully joined the ${heistData.name} heist!`)
            })
        }
    },
    {
        name: "leave",
        invoke: async (client: Client, message: Message, args: string[]) => {
            const author = message.author
            const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
            if (!record) {
                MessageTemplates.AssertAccountRequired(message)
                return
            }

            const heist = HeistMethods.GetUserHeist(author)
            if (!heist) {
                message.channel.send("You currently aren't participating in a heist.")
                return
            }

            HeistMethods.LeaveHeist(author)
            message.channel.send(`Successfully left heist ${heist.Heist.name}.`)
        }
    },
    {
        name: "setmask",
        invoke: async (client: Client, message: Message, args: string[]) => {
            const author = message.author
            const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
            if (!record) {
                MessageTemplates.AssertAccountRequired(message)
                return
            }

            const mask = args.slice(2).join(" ")
            if (!mask) {
                message.channel.send("Please specify a mask to equip.")
                return
            }

            const id = await DatabaseMethods.ItemMethods.GetItemIdByName(mask.toLowerCase())
            const item = await DatabaseMethods.ItemMethods.GetItemById(id || 0)
            if (!item) {
                message.channel.send("Invalid item.")
                return
            }

            if (!item.type.includes(ItemType.Mask)) {
                message.channel.send("That item is not a mask.")
                return
            }

            if (!record.inventory.includes(item.id)) {
                message.channel.send("You do not own that item.")
                return
            }

            await DatabaseMethods.UserMethods.SetMask(author.id, item.id).then(() => {
                message.channel.send(`Successfully equipped mask ${item.name}!`)
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

        const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
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