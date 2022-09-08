import Command from "../interfaces/Command";
import { Client, Message } from "discord.js"
import Config from "../config"
import * as DatabaseMethods from "../Database"

const RecentlyUsed = new Set()
const MaxAmount = 5000
const Fines = [250, 500, 1000]
const Cooldown = 900000

const Cmd: Command = {
    Name: "mug",
    Description: "Allows you to mug another user.",
    Usage: `\`${Config.prefix}mug\``,
    Aliases: ["rob", "steal"],
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const user = message.mentions.members?.first()
        const author = message.author
        if (RecentlyUsed.has(author.id)) {
            message.channel.send("Please wait 15 minutes before mugging someone again.")
            return
        }

        if (!user) {
            message.channel.send("Please mention a user.")
            return
        }

        const authorRecord = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
        if (!authorRecord) {
            message.channel.send(`You must have a BankingBot account initialised. Use \`${Config.prefix}account create\` to create one.`)
            return
        }

        const victimRecord = await DatabaseMethods.UserMethods.GetUserRecord(user.id)
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

        if (!authorRecord.inventory.includes(15)) {
            message.channel.send(`You must own a pistol to mug someone. Use \`${Config.prefix}shop purchase Pistol\` to buy one for $5,000.`)
            return
        }

        const amount = Math.floor(Math.random() * MaxAmount)
        if (victimRecord.cash < amount) {
            const index = Math.floor(Math.random() * Fines.length)
            const fine = Fines[index]
            await DatabaseMethods.UserMethods.RemoveFromBalance(author.id, fine).then(() => {
                message.channel.send(`You failed to mug <@${user.id}> and you were caught! You were fined $${fine}.`)
            })
            return
        }

        await DatabaseMethods.UserMethods.RemoveFromBalance(user.id, amount).then(async () => {
            const xp = Math.floor(amount / 100)
            await DatabaseMethods.UserMethods.GiveXP(author.id, Math.floor(xp))
            await DatabaseMethods.UserMethods.AddToBalance(author.id, amount).then(() => {
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