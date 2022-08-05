import Command from "../interfaces/commandInterface";
import Config from "../config.json"
import { Client, Message } from "discord.js"

const RecentlyUsed = new Set()
const Cmd: Command = {
    Name: "horserace",
    Description: "Allows you to bet on a horse",
    Usage: `\`${Config.prefix}horserace <color> <amount>\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        if (RecentlyUsed.has(author.id)) {
            message.channel.send("You must wait 10 minutes before you can horse race again.")
            return
        }
    }
}

export default Cmd