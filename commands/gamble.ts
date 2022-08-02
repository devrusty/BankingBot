import Command from "../interfaces/commandInterface";
import { Client, Message, User } from "discord.js";
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";

const Cmd: Command = {
    Name: "gamble",
    Description: "Allows you to gamble your money. 1 in 4 chance of increasing your cash by x1.25",
    Usage: "b!gamble <amount>",
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        if (!DatabaseMethods.UserRecordExists(message.author)) {
            message.channel.send("You must have a BankingBot account initialised before you can gamble! Use `b!create`.")
            return
        }
        if (!args[1]) {
            message.channel.send("Please enter an amount.")
            return
        }

        const gambleAmount: number = Number(args[1])
        const user: User = message.author
        const balance: number = await DatabaseMethods.GetUserBalance(user)

        if (gambleAmount <= 0) {
            message.channel.send("Please gamble an amount larger than 0.")
            return
        }

        if (balance < gambleAmount) {
            message.channel.send("You cannot afford to gamble that much money.")
            return
        }

        const chanceGoal: number = Math.floor(Math.random() * 4)
        const chanceResult: number = Math.floor(Math.random() * 4)

        if (chanceResult !== chanceGoal) {
            await DatabaseMethods.RemoveFromBalance(user, gambleAmount)
            message.channel.send(`You lost $${FormatMoney(gambleAmount)}!`)
            return
        }

        const earnAmount: number = Math.floor(gambleAmount * 1.25)
        await DatabaseMethods.AddToBalance(user, earnAmount)
        await DatabaseMethods.GiveXP(user, 10)

        message.channel.send(`You won $${FormatMoney(earnAmount)} and 10 XP!`)
    }
}

export default Cmd