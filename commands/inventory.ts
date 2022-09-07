import Config from "../config"
import * as DatabaseMethods from "../Database"
import { Client, EmbedBuilder, Message } from "discord.js"
import Command from "../interfaces/commandInterface"
import * as Prisma from "@prisma/client"
import FormatMoney from "../methods/FormatMoney"

const GetFields = async (items: any) => {
    const itemArray = (items as number[])
    if (itemArray.length > 25) itemArray.length = 25

    return itemArray.map(async (id) => {
        const item = await DatabaseMethods.ItemMethods.GetItemById(id)
        return {
            name: item?.name || "Unknown",
            value: item?.description || `There was an issue while getting data for ID ${id}.`,
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
    const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)

    if (!record) {
        message.channel.send(`You must have a BankingBot account initialised to use that command! Use \`${Config.prefix}account create\` to initialise one.`)
        return
    }

    const inventoryItems = record.inventory

    if (inventoryItems.length > 25) inventoryItems.length = 25

    const capacity = user.premium ? 100 : 25
    const inventoryEmbed = new EmbedBuilder()
    inventoryEmbed.setTitle(`${author.tag}'s Inventory`)
    inventoryEmbed.setColor("Red")

    const fields = await GetFields(inventoryItems)
    const resolved = await Promise.all(fields)
    if (!resolved) {
        console.log(resolved)
        message.channel.send("There was an issue while fetching inventory. If you need any assistance, please join the official Discord. https://discord.gg/jqD8Udk58E")
        return
    }

    inventoryEmbed.setFields(resolved)

    if (inventoryItems.length == 0) inventoryEmbed.setDescription(`Your inventory is empty! Use \`${Config.prefix}shop\` to view the shop.`)

    let netWorth = 0
    for (const id of inventoryItems) {
        const item = await DatabaseMethods.ItemMethods.GetItemById(id)
        if (item) netWorth += item.price
    }

    inventoryEmbed.setFooter({
        text: `Net worth: $${FormatMoney(netWorth)} • Balance: $${FormatMoney(record.cash)} • Total: $${FormatMoney(netWorth + record.cash)}\n${inventoryItems.length}/${capacity} - Want a larger inventory? Learn more with ${Config.prefix}help premium.`
    })

    message.channel.send({
        embeds: [inventoryEmbed]
    })
}

const Cmd: Command = {
    Name: "inventory",
    Description: "Displays your inventory.",
    Usage: `\`${Config.prefix}inventory\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
        if (!record) {
            message.channel.send(`You must have a BankingBot account initialised to use that command! Use \`${Config.prefix}account create\``)
            return
        }

        await DisplayInventoryEmbed(record, message)
    }
}

export default Cmd