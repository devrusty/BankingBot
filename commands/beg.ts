import Command from "../interfaces/commandInterface";
import { Client, Message } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";

const Cooldown = 120000
const MaxAmount = 1000

const RecentlyBegged = new Set<string>()
const Cmd: Command = {
    Name: "beg",
    Description: "Gives you a random amount of cash from 1 - 1000. Can only be used once every 2 minutes.",
    Usage: "b!beg",
    Listed: true,
    Invoke: async (client: Client, message: Message) => {
        const author = message.author
        const userRecordExists = await DatabaseMethods.UserRecordExists(author)
        if (!userRecordExists) {
            message.channel.send("You must have a BankingBot account initialised to use `b!beg`. Please use `b!create`")
            return
        }

        if (RecentlyBegged.has(author.id)) {
            message.channel.send("Please wait 2 minutes before begging again.")
            return
        }

        const randomAmount = Math.floor(Math.random() * MaxAmount)
        DatabaseMethods.AddToBalance(author, randomAmount).then(() => {
            message.channel.send(`You got $${FormatMoney(randomAmount)} from begging.`)
            RecentlyBegged.add(author.id)

            setTimeout(() => {
                RecentlyBegged.delete(author.id)
            }, Cooldown)
        })
    }
}

export default Cmd