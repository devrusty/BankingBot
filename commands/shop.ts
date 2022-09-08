import Command from "../interfaces/Command";
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../Database"
import FormatMoney from "../methods/FormatMoney";
import Config from "../config"

const GetItemFields = async () => {
    const items = await DatabaseMethods.ItemMethods.GetOnsaleItems()

    return items.map(item => {
        return {
            name: `${item.name} - $${FormatMoney(item.price)}`,
            value: `${item.description}`,
            inline: true
        }
    })
}

const Purchase = async (client: Client, message: Message, args: string[]) => {
    const item: string = args.slice(2).join(" ")
    if (!item) {
        message.channel.send("Please specify an item that you would like to purchase.")
        return
    }

    const author = message.author
    const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)

    if (!record) {
        message.channel.send(`You do not have a BankingBot account initialised! Use \`${Config.prefix}account create\` to initialise one.`)
        return
    }

    const id = await DatabaseMethods.ItemMethods.GetItemIdByName(item)
    if (!id) {
        message.channel.send("Item doesn't exist.")
        return
    }

    const itemData = await DatabaseMethods.ItemMethods.GetItemById(id)
    if (!itemData) {
        message.channel.send("Item doesn't exist.")
        return
    }

    if (record.inventory.includes(id)) {
        message.channel.send(`You already own a ${item}`)
        return
    }

    const capacity = record.premium ? 25 : 100
    if (record.inventory.length == capacity) {
        message.channel.send("You've reached the maximum amount of items that you can have in your inventory.")
        return
    }

    const response = await DatabaseMethods.ItemMethods.PurchaseItem(author.id, item)
    if (!response) {
        message.channel.send(`Successfully purchased ${itemData.name}`)
        return
    }

    message.channel.send(response)
}

const GetInfo = async (client: Client, message: Message, args: string[]) => {
    const item = args.slice(2).join(" ")
    if (!item) {
        message.channel.send("Please specify an item.")
        return
    }

    const itemId = await DatabaseMethods.ItemMethods.GetItemIdByName(item)
    if (!itemId) {
        message.channel.send(`Item of name "${item}" does not exist.`)
        return
    }

    const itemData = await DatabaseMethods.ItemMethods.GetItemById(itemId)
    if (!itemData) {
        message.channel.send(`Item of name "${item}" does not exist.`)
        return
    }

    const infoEmbed = new EmbedBuilder()
    infoEmbed.setTitle(`Item - ${itemData?.name}`)
    infoEmbed.setColor("Red")
    infoEmbed.setFields(
        { name: "ID", value: String(itemData.id) },
        { name: "Name", value: itemData.name },
        { name: "Description", value: itemData.description },
        { name: "Price", value: `$${itemData.price}` },
        { name: "Onsale", value: String(itemData.onSale) }
    )

    message.channel.send({
        embeds: [infoEmbed]
    })
}

const Cmd: Command = {
    Name: "shop",
    Description: "Shop interface",
    Usage: `\`${Config.prefix}shop\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        let param = args[1]
        if (!param) {
            const shopEmbed: EmbedBuilder = new EmbedBuilder()
            shopEmbed.setTitle("Item Shop")
            shopEmbed.setColor("Red")
            shopEmbed.setDescription(`Use \`${Config.prefix}shop buy <itemName>\` to purchase an item.\nUse \`${Config.prefix}shop info <itemName>\` to view the information of an item.`)
            shopEmbed.addFields(await GetItemFields())

            message.channel.send({
                embeds: [shopEmbed]
            })

            return
        }

        param = param.toLowerCase()
        if (param == "buy") {
            await Purchase(client, message, args)
            return
        }

        if (param == "info") {
            await GetInfo(client, message, args)
            return
        }
    }
}

export default Cmd