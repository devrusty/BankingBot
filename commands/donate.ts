import Command from "../interfaces/commandInterface";
import { Client, Message } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"

const Cmd: Command = {
    Name: "donate",
    Description: "Give money to another member",
    Usage: "b!donate <user> <amount>",
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const reciever = message.mentions.members?.first()
        const amount = Number(args[2])

        if (!reciever) {
            message.channel.send("Please mention someone to donate to.")
            return
        }

        if (!amount) {
            message.channel.send("Please specify an amount to donate.")
            return
        }

        const userRecord = await DatabaseMethods.GetUserRecord(author)
        const recieverRecord = await DatabaseMethods.GetUserRecord(reciever.user)
        if (!userRecord) {
            message.channel.send("Use `b!create` to initialise a BankingBot account!")
            return
        }

        if (!recieverRecord) {
            message.channel.send("The member you're try to donate to does not have a BankingBot account initialised!")
            return
        }

        if (userRecord.cash < amount) {
            message.channel.send("You cannot afford to donate that much cash!")
            return
        }

        await DatabaseMethods.RemoveFromBalance(author, amount).catch(err => {
            console.trace(err)
        })

        await DatabaseMethods.AddToBalance(reciever.user, amount).catch(err => {
            console.trace(err)
        })

        message.channel.send(`Successfully donated ${amount} to ${reciever.user.tag}!`)
    }
}

export default Cmd