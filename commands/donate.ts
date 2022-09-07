import Command from "../interfaces/commandInterface";
import { Client, Message } from "discord.js"
import * as DatabaseMethods from "../Database"
import Donation from "../interfaces/donation";
import Config from "../config"
import FormatMoney from "../methods/FormatMoney";

const Cooldown = 300000
const RecentlyDonated = new Set<string>()
const RecentlyRecieved = new Set<string>()

const Cmd: Command = {
    Name: "donate",
    Description: "Give money to another member",
    Usage: `\`${Config.prefix}donate\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const reciever = message.mentions.members?.first()
        const amount = Number(args[2])

        if (RecentlyDonated.has(author.id)) {
            message.channel.send("Please wait 5 minutes before donating again.")
            return
        }

        if (!reciever) {
            message.channel.send("Please mention someone to donate to.")
            return
        }

        if (RecentlyRecieved.has(reciever.id)) {
            message.channel.send("The person you're trying to donate to has already recieved money in the past 5 minutes. Please wait before donating to them.")
            return
        }

        if (reciever.id == message.author.id) {
            message.channel.send("You cannot donate to yourself silly!")
            return
        }

        if (!amount) {
            message.channel.send("Please specify an amount to donate.")
            return
        }

        const userRecord = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
        const recieverRecord = await DatabaseMethods.UserMethods.GetUserRecord(reciever.user.id)
        if (!userRecord) {
            message.channel.send(`Use \`${Config.prefix}account create\` to initialise a BankingBot account!`)
            return
        }

        if (!recieverRecord) {
            message.channel.send("The member you're trying to donate to does not have a BankingBot account initialised!")
            return
        }

        if (recieverRecord.banned) {
            message.channel.send("The user that you're donating to is banned from BankingBot.")
            return
        }

        if (amount <= 0) {
            message.channel.send("Please specify an amount larger than $0.")
            return
        }

        const donationLimit = userRecord.premium ? 100000 : 50000
        if (amount > donationLimit) {
            message.channel.send(`You cannot donate more than $${FormatMoney(donationLimit)}!`)
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

        await DatabaseMethods.UserMethods.CreateDonationRecord(Data)
        await DatabaseMethods.UserMethods.RemoveFromBalance(author.id, amount).catch(err => {
            console.trace(err)
        })

        await DatabaseMethods.UserMethods.AddToBalance(reciever.user.id, amount).then(() => {
            message.channel.send(`Successfully donated $${FormatMoney(amount)} to ${reciever.user.tag}!`)

            RecentlyDonated.add(author.id)
            RecentlyRecieved.add(reciever.id)

            setTimeout(() => {
                RecentlyDonated.delete(author.id)
                RecentlyRecieved.delete(reciever.id)
            }, Cooldown)
        }).catch((err) => {
            console.log(err)
            message.channel.send("An error occured while performing that command. This error has been logged and will be looked into.")
        })
    }
}

export default Cmd