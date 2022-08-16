import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder, messageLink } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";
import Config from "../config.json"

const GetItemFields = async () => {
    const items = await DatabaseMethods.GetOnsaleItems()

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
    const response = await DatabaseMethods.PurchaseItem(author.id, item)

    if (!response) {
        message.channel.send(`Successfully purchased ${item}`)
        return
    }

    message.channel.send(response)
}

const Cmd: Command = {
    Name: "shop",
    Description: "Shop interface",
    Usage: `\`${Config.prefix}shop ?purchase <?item>\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        if (args[1] == "purchase") {
            await Purchase(client, message, args)
            return
        }

        const shopEmbed: EmbedBuilder = new EmbedBuilder()
        shopEmbed.setTitle("Item Shop")
        shopEmbed.setColor("Red")
        shopEmbed.setDescription(`Use \`${Config.prefix}shop purchase <itemName>\` to purchase an item.`)
        shopEmbed.addFields(await GetItemFields())

        message.channel.send({
            embeds: [shopEmbed]
        })
    }
}

export default Cmd