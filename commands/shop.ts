import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder, messageLink } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"

const GetItemFields = async () => {
    const items = await DatabaseMethods.GetOnsaleItems()

    return items.map(item => {
        return {
            name: `${item.name} - $${item.price}`,
            value: `${item.description}`,
            inline: true
        }
    })
}

const Cmd: Command = {
    Name: "shop",
    Description: "Shop interface",
    Usage: "b!shop <?buy> <?item>",
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const shopEmbed: EmbedBuilder = new EmbedBuilder()
        shopEmbed.setTitle("Item Shop")
        shopEmbed.setColor("Red")
        shopEmbed.addFields(await GetItemFields())

        message.channel.send({
            embeds: [shopEmbed]
        })
    }
}

export default Cmd