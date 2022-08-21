import Command from "../interfaces/commandInterface";
import { Client, Message, User } from "discord.js";
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";
import Config from "../config.json"

const RecentlyUsed = new Set()

const Cmd: Command = {
    Name: "gamble",
    Description: "Allows you to gamble your money. 1 in 4 chance of increasing your cash by x1.25 (x1.50 if premium)",
    Usage: `\`${Config.prefix}gamble\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        if (!args[1]) {
            message.channel.send("Please enter an amount.")
            return
        }

        const gambleAmount: number = Number(args[1])
        const user: User = message.author
        const userRecord = await DatabaseMethods.GetUserRecord(user.id)

        if (!userRecord) {
            message.channel.send(`You must have a BankingBot account initialised before you can gamble! Use \`${Config.prefix}account create\`.`)
            return
        }

        if (RecentlyUsed.has(user.id)) {
            message.channel.send("Please wait 30 seconds before gambling again.")
            return
        }

        if (gambleAmount < 75) {
            message.channel.send("Please gamble an amount larger than 75.")
            return
        }

        if (gambleAmount > 100000) {
            message.channel.send("You cannot gamble over 100k.")
            return
        }

        if (userRecord.cash < gambleAmount) {
            message.channel.send("You cannot afford to gamble that much money.")
            return
        }

        RecentlyUsed.add(user.id)

        setTimeout(() => {
            RecentlyUsed.delete(user.id)
        }, 30000)

        const chanceGoal: number = Math.floor(Math.random() * 4)
        const chanceResult: number = Math.floor(Math.random() * 4)

        if (chanceResult !== chanceGoal) {
            await DatabaseMethods.RemoveFromBalance(user.id, gambleAmount)
            message.channel.send(`You lost $${FormatMoney(gambleAmount)}!`)
            return
        }

        const amount = Math.floor(gambleAmount * 1.25)
        const xpAmount = Math.floor(amount / 100)
        const finalAmount: number = userRecord.premium ? amount : Math.floor(amount * 1.50)

        await DatabaseMethods.AddToBalance(user.id, finalAmount)
        await DatabaseMethods.GiveXP(user.id, xpAmount)

        message.channel.send(`You won $${FormatMoney(finalAmount)} and ${xpAmount} XP!`)
    }
}

export default Cmd