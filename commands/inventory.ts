import Command from "../interfaces/commandInterface"
import Config from "..//config.json"
import { Client, Message, User, EmbedBuilder, messageLink } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"

const GetInventoryItemFields = async (message: Message, user: User) => {
    const userRecord = await DatabaseMethods.GetUserRecord(user.id)
    if (!userRecord) {
        message.channel.send("You must have a BankingBot account initialised!")
        return
    }

    const fields = userRecord.inventory.map((item) => {

    })
}

const DisplayInventoryPage = async (page = 1, user: User) => {
    const inventoryEmbed = new EmbedBuilder()
    inventoryEmbed.setTitle(`${user.tag}'s Inventory`)


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

        await DisplayInventoryPage(1, author)
    }
}

export default Cmd