import Command from "../interfaces/commandInterface";
import { Client, Message, ReactionUserManager } from "discord.js"
import Config from "../config.json"
import * as DatabaseMethods from "../databaseMethods"

const RecentlyUsed = new Set()
const MaxAmount = 5000
const Fines = [250, 500, 1000]
const Cooldown = 3600000

const Cmd: Command = {
    Name: "mug",
    Description: "Allows you to mug another user.",
    Usage: `\`${Config.prefix}mug\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const user = message.mentions.members?.first()
        const author = message.author
        if (RecentlyUsed.has(author.id)) {
            message.channel.send("Please wait an hour before mugging someone again.")
            return
        }

        if (!user) {
            message.channel.send("Please mention a user.")
            return
        }

        const authorRecord = await DatabaseMethods.GetUserRecord(author.id)
        if (!authorRecord) {
            message.channel.send(`You must have a BankingBot account initialised. Use \`${Config.prefix}account create\` to create one.`)
            return
        }

        const victimRecord = await DatabaseMethods.GetUserRecord(user.id)
        if (!victimRecord) {
            message.channel.send("The person you're trying to mug does not have a BankingBot account initialised.")
            return
        }

        if (victimRecord.premium) {
            message.channel.send("The person you're trying to mug is a premium user. Premium users are immune to mugging.")
            return
        }

        if (victimRecord.cash == 0) {
            message.channel.send("The person you're trying to mug does not have any money.")
            return
        }

        const amount = Math.floor(Math.random() * MaxAmount)
        if (victimRecord.cash < amount) {
            const index = Math.floor(Math.random() * Fines.length)
            const fine = Fines[index]
            await DatabaseMethods.RemoveFromBalance(author.id, fine).then(() => {
                message.channel.send(`You failed to mug <@${user.id}> and you were caught! You were fined $${fine}.`)
            })
            return
        }

        await DatabaseMethods.RemoveFromBalance(user.id, amount).then(async () => {
            const xp = Math.floor(amount / 100)
            await DatabaseMethods.GiveXP(author.id, Math.floor(xp))
            await DatabaseMethods.AddToBalance(author.id, amount).then(() => {
                message.channel.send(`You successfully mugged <@${user.id}> for $${amount} and ${xp} XP!`)
                RecentlyUsed.add(author.id)

                setTimeout(() => {
                    RecentlyUsed.delete(author.id)
                }, Cooldown)
            })
        })
    }
}

export default Cmd