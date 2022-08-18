import Config from "../config.json"
import * as DatabaseMethods from "../databaseMethods"
import { Client, EmbedBuilder, Message } from "discord.js"
import Command from "../interfaces/commandInterface"
import * as Prisma from "@prisma/client"

const GetFields = (items: any) => {
    return (items as Prisma.Item[]).map((item, index) => {
        return {
            name: item.name || "Unknown",
            value: item.description || `There was an issue while getting data for ID ${index}.`,
            inline: true
        }
    })
}

const DisplayInventoryEmbed = async (user: Prisma.User, message: Message) => {
    if (!user) {
        message.channel.send("User doesn't exist.")
        return
    }

    const author = message.author
    const inventoryItems = await DatabaseMethods.GetUserInventory(author.id)

    if (!inventoryItems) {
        console.warn(`User ${author.tag}'s inventory is false, whilst existing.`)
        message.channel.send("There was an error while fetching inventory items. This has been logged.")
        return
    }

    console.log(inventoryItems)
    if (inventoryItems.length > 25) inventoryItems.length = 25

    const inventoryEmbed = new EmbedBuilder()
    inventoryEmbed.setTitle(`${author.tag}'s Inventory`)
    inventoryEmbed.setColor("Red")

    const fields = GetFields(inventoryItems)
    inventoryEmbed.setFields(fields)

    if (inventoryItems.length == 0) inventoryEmbed.setDescription(`Your inventory is empty! Use \`${Config.prefix}shop\` to view the shop.`)

    message.channel.send({
        embeds: [inventoryEmbed]
    })

}

const Cmd: Command = {
    Name: "inventory",
    Description: "Displays your inventory.",
    Usage: `\`${Config.prefix}inventory\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const record = await DatabaseMethods.GetUserRecord(author.id)
        if (!record) {
            message.channel.send(`You must have a BankingBot account initialised to use that command! Use \`${Config.prefix}account create\``)
            return
        }

        await DisplayInventoryEmbed(record, message)
    }
}

export default Cmd