import Command from "../interfaces/commandInterface";
import Config from "../config.json"
import { Client, Message } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"

const Cmd: Command = {
    Name: "heist",
    Description: "Heist and heist profile management.",
    Usage: `\`${Config.prefix}heist\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        if (!Config.developers.includes(author.id)) {
            message.channel.send(`\`${Config.prefix}heist\` is currently in development. In the meanwhile, join the BankingBot Discord to get updated when heists are released\nhttps://discord.gg/jqD8Udk58E`)
            console.log(`${author.tag} is interested in heists.`)
            return
        }

        const record = await DatabaseMethods.GetUserRecord(author.id)
        if (!record) {
            message.channel.send(`You must have a BankingBot account initialised to use that command. Use \`${Config.prefix} to create one.\``)
            return
        }
    }
}

export default Cmd