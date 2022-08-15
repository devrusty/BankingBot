import Command from "../interfaces/commandInterface"
import Config from "..//config.json"
import { Client, Message, User, EmbedBuilder, APIEmbedField } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"

const GetInventoryItemFields = async (message: Message, user: User, page: number) => {
    const userRecord = await DatabaseMethods.GetUserRecord(user.id)
    if (!userRecord) {
        message.channel.send("You must have a BankingBot account initialised!")
        return { name: "Failed", value: "Failed" }
    }

    const inventory = userRecord.inventory
    let fields = new Array<APIEmbedField>()

    for (var id = 0; id < inventory.length; id++) {
        const itemData = await DatabaseMethods.GetItemById(id)
        if (!itemData) {
            fields.push({
                name: "Unknown",
                value: `Item of ID ${id} does not exist.`,
                inline: true
            })
            return
        }

        fields.push({
            name: itemData.name,
            value: itemData.description,
            inline: true
        })
    }

    return fields
}

const DisplayInventoryPage = async (page = 1, user: User, message: Message) => {
    const inventoryEmbed = new EmbedBuilder()
    inventoryEmbed.setTitle(`${user.tag}'s Inventory`)
    inventoryEmbed.setColor("Red")

    const fields = await GetInventoryItemFields(message, user, page)
    if (!fields) {

        return
    }
    //inventoryEmbed.setFields(fields)
}

const Cmd: Command = {
    Name: "inventory",
    Description: "Displays your inventory.",
    Usage: `\`${Config.prefix}inventory <?page>\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const recordExists = await DatabaseMethods.UserRecordExists(author.id)
        if (!recordExists) {
            message.channel.send(`You must have a BankingBot account initialised to view your inventory. Use \`${Config.prefix}account create\` to initialise one.`)
            return
        }

        await DisplayInventoryPage(1, author, message)
    }
}

export default Cmd