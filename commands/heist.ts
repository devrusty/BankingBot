import Command from "../interfaces/commandInterface";
import Config from "../config.json"
import { Client, Message } from "discord.js"

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
    }
}

export default Cmd