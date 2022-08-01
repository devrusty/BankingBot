import Command from "../interfaces/commandInterface"
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney"

let Bot: Client
let Users = new Array()

let LotteryMax = 100000000
let LotteryAmount = Math.floor(Math.random() * LotteryMax)

const Time = 3600000
const LotteryAnnouncementChannel = "1003737671908204644"

const SendInfo = (message: Message) => {
    const Embed = new EmbedBuilder()

    Embed.setTitle("BankingBot Lottery")
    Embed.setDescription(`Use the command \`b!lottery\` to have a chance of being drawn to win $${FormatMoney(LotteryAmount)}`)
    Embed.addFields(
        { name: "Jackpot", value: `$${FormatMoney(LotteryAmount)}`, inline: true },
        { name: "Users", value: String(Users.length), inline: true }
    )
    Embed.setColor("Yellow")

    message.channel.send({
        embeds: [Embed]
    })
}

const Cmd: Command = {
    Name: "lottery",
    Description: "Picks a random user from a list of the enrolled users every hour to recieve a random amount of cash from 10,000 - 100,000,000",
    Usage: "lottery ?info",
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        Bot = client

        const author = message.author
        const action = args[1]
        if (action && action.toLowerCase() == "info") {
            SendInfo(message)
            return
        }
        if (Users.includes(author.id)) {
            message.channel.send("You're already in the lottery list. Use `b!lottery info` to see the lottery info.")
            return
        }

        Users.push(author.id)
        message.channel.send("You have been added to the lottery list. You can see who won in the BankingBot support server.")
    }
}

const ResetLottery = () => {
    LotteryAmount = Math.floor(Math.random() * LotteryMax)
    Users = new Array()
    setTimeout(GetWinner, Time)
}

const GetWinner = async () => {
    const randomNum = Math.floor(Math.random() * Users.length)
    const winnerId = Users[randomNum]
    const winner = Bot.users.cache.get(winnerId)
    //const announcementChannel = Bot.channels.cache.get(LotteryAnnouncementChannel)

    if (!winner) {
        console.log("There was an issue while getting the lottery winner!")
        return
    }

    await DatabaseMethods.AddToBalance(winner, LotteryAmount)
    ResetLottery()
}

setTimeout(GetWinner, Time)

export default Cmd