import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js"
import Config from "../config.json"
import * as DatabaseMethods from "../databaseMethods"
import { User } from "@prisma/client"

const GetAchievementsFields = async () => {
    const achievements = await DatabaseMethods.GetAchievements()
    const fields = achievements.map((achievement) => {
        return {
            name: achievement.name,
            value: achievement.description,
            inline: true
        }
    })

    return fields
}

const SendAchievementsEmbed = async (message: Message) => {
    const author = message.author
    const embed = new EmbedBuilder()
    embed.setTitle("Achievements")
    embed.setColor("Red")
    embed.setDescription("List of all BankingBot achievements.\n✅ = Owned achievement.")

    const record = await DatabaseMethods.GetUserRecord(author.id)
    const fields = await GetAchievementsFields()

    embed.setFields(fields)

    if (record) {
        if (!embed.data.fields) return
        const ownedAchievements = embed.data.fields.map(async (achievement) => {
            const achievementData = await DatabaseMethods.GetAchievementByName(achievement.name)
            if (achievementData && record.achievements.includes(achievementData.id)) {
                achievement.name = `✅ ${achievementData.name}`
                console.log(achievement.name)
            }

            return achievement
        })

        const resolved = await Promise.all(ownedAchievements)
        embed.setFields(resolved)
    }

    message.channel.send({
        embeds: [embed]
    })
}

const Cmd: Command = {
    Name: "achievements",
    Description: "Displays achievements embed.",
    Usage: `\`${Config.prefix}achievements\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        await SendAchievementsEmbed(message)
    }
}

export default Cmd