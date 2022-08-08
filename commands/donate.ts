import Command from "../interfaces/commandInterface";
import { Client, Message } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import Donation from "../interfaces/donation";
import Config from "../config.json"

const Cmd: Command = {
    Name: "donate",
    Description: "Give money to another member",
    Usage: `\`${Config.prefix}donate <user> <amount>\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const reciever = message.mentions.members?.first()
        const amount = Number(args[2])

        if (reciever?.id == message.author.id) {
            message.channel.send("You cannot donate to yourself silly!")
            return
        }

        if (!reciever) {
            message.channel.send("Please mention someone to donate to.")
            return
        }

        if (!amount) {
            message.channel.send("Please specify an amount to donate.")
            return
        }

        const userRecord = await DatabaseMethods.GetUserRecord(author.id)
        const recieverRecord = await DatabaseMethods.GetUserRecord(reciever.user.id)
        if (!userRecord) {
            message.channel.send(`Use \`${Config.prefix}account create\` to initialise a BankingBot account!`)
            return
        }

        if (!recieverRecord) {
            message.channel.send("The member you're trying to donate to does not have a BankingBot account initialised!")
            return
        }

        if (amount <= 0) {
            message.channel.send("Please specify an amount larger than 0.")
            return
        }

        if (userRecord.cash < amount) {
            message.channel.send("You cannot afford to donate that much cash!")
            return
        }

        const Data: Donation = {
            donator: author.id,
            reciever: reciever.user.id,
            amount: amount
        }

        await DatabaseMethods.CreateDonationRecord(Data)

        await DatabaseMethods.RemoveFromBalance(author.id, amount).catch(err => {
            console.trace(err)
        })

        await DatabaseMethods.AddToBalance(reciever.user.id, amount).catch(err => {
            console.trace(err)
        })

        message.channel.send(`Successfully donated ${amount} to ${reciever.user.tag}!`)
    }
}

export default Cmd