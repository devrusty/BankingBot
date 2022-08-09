import Command from "../interfaces/commandInterface"
import { Client, Message, EmbedBuilder, User } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney"
import Config from "../config.json"

let Bot: Client
let Users = new Array()

let LotteryDefault = 10000
let LotteryAmount = LotteryDefault
let LotteryXP = LotteryAmount / 100

const Time = 3600000
const LotteryAnnouncementChannel = "1003737671908204644"

const SendInfo = (message: Message) => {
    const Embed = new EmbedBuilder()

    Embed.setTitle("BankingBot Lottery")
    Embed.setDescription(`Use the command \`${Config.prefix}lottery\` to have a chance of being drawn to win $${FormatMoney(LotteryAmount)} and ${FormatMoney(LotteryXP)} XP`)
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
    Usage: `\`${Config.prefix}lottery ?info\``,
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
            message.channel.send(`You're already in the lottery list. Use \`${Config.prefix}lottery info\` to see the lottery info.`)
            return
        }

        Users.push(author.id)

        LotteryAmount *= 2
        LotteryXP = LotteryAmount / 100

        message.channel.send("You have been added to the lottery list. You can see who won in the BankingBot support server.")
    }
}

const ResetLottery = () => {
    LotteryAmount = LotteryDefault
    LotteryXP = LotteryDefault / 100

    Users = new Array()
    setTimeout(GetWinner, Time)
}

const GetWinner = async () => {
    if (Users.length === 0) {
        console.log("There weren't any users in the lottery.")
        return
    }

    const randomNum = Math.floor(Math.random() * Users.length)
    const winnerId = Users[randomNum]
    const winner = Bot.users.cache.get(winnerId)
    //const announcementChannel = Bot.channels.cache.get(LotteryAnnouncementChannel)

    if (!winner) {
        console.log(`Lottery winner is undefined. : ${Users}`)
        return
    }

    await DatabaseMethods.AddToBalance(winner.id, LotteryAmount)
    await DatabaseMethods.GiveXP(winner.id, LotteryXP)

    ResetLottery()
}

setTimeout(GetWinner, Time)

export default Cmd