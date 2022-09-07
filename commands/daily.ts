import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../Database"
import FormatMoney from "../methods/FormatMoney"
import Config from "../config"
import * as JobMethods from "../methods/Jobs"

let RecentlyClaimed = new Set()

const DefaultDailyReward = 500
const PremiumDailyReward = DefaultDailyReward * 2

const Cmd: Command = {
    Name: "daily",
    Description: "Lets you claim your daily reward.",
    Usage: `\`${Config.prefix}daily\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const recordExists = await DatabaseMethods.UserMethods.UserRecordExists(author.id)

        if (!recordExists) {
            message.channel.send(`You must initialise a BankingBot account before you can claim a daily reward. Use \`${Config.prefix}account create\``)
            return
        }

        if (RecentlyClaimed.has(author.id)) {
            message.channel.send("You've already claimed your daily reward. Please wait 24 hours.")
            return
        }

        const userRecord = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
        if (!userRecord) {
            message.channel.send(`You must initialise a BankingBot account before you can claim a daily reward. Use \`${Config.prefix}account create\``)
            return
        }

        let amount = DefaultDailyReward
        let job

        if (userRecord.occupation !== 0)
            job = await DatabaseMethods.JobMethods.GetJobById(userRecord.occupation)

        if (job) amount += Math.floor(JobMethods.GetJobIncome(job) * 6)
        if (userRecord.premium) amount *= 2

        RecentlyClaimed.add(author.id)

        await DatabaseMethods.UserMethods.AddToBalance(author.id, amount).then(() => {
            setTimeout(() => {
                RecentlyClaimed.delete(author.id)
            }, 86400000)
        })

        const rewardEmbed = new EmbedBuilder()
        rewardEmbed.setTitle("Claimed daily reward!")
        rewardEmbed.setColor("Red")
        rewardEmbed.setDescription(`Successfully claimed your daily reward of $${FormatMoney(amount)}.`)

        message.channel.send({
            embeds: [rewardEmbed]
        })
    }
}

export default Cmd