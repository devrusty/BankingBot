import Command from "../interfaces/commandInterface";
import { Client, Message } from "discord.js"
import * as DatabaseMethods from "../Database"
import FormatMoney from "../methods/FormatMoney";
import Config from "../config"
import * as MessageTemplates from "../methods/MessageTemplates"

const Cooldown = 20000
const MaxAmount = 500

const RecentlyBegged = new Set<string>()
const Cmd: Command = {
    Name: "beg",
    Description: "Gives you a random amount of cash from 1 - 250. Can only be used once every 2 minutes.",
    Usage: `\`${Config.prefix}beg\``,
    Listed: true,
    Invoke: async (client: Client, message: Message) => {
        const author = message.author
        const userRecordExists = await DatabaseMethods.UserRecordExists(author.id)
        if (!userRecordExists) {
            MessageTemplates.AssertAccountRequired(message)
            return
        }

        if (RecentlyBegged.has(author.id)) {
            message.channel.send("Please wait 20 second before begging again.")
            return
        }

        const randomAmount = Math.floor(Math.random() * MaxAmount)
        DatabaseMethods.AddToBalance(author.id, randomAmount).then(() => {
            message.channel.send(`You got $${FormatMoney(randomAmount)} from begging.`)
            RecentlyBegged.add(author.id)

            setTimeout(() => {
                RecentlyBegged.delete(author.id)
            }, Cooldown)
        })
    }
}

export default Cmd