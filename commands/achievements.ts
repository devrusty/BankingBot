import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder, User } from "discord.js"
import Config from "../config"
import * as DatabaseMethods from "../Database"

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

const SendAchievementsEmbed = async (message: Message, user: User) => {
    const embed = new EmbedBuilder()
    embed.setTitle("Achievements")
    embed.setColor("Red")
    embed.setDescription("List of all BankingBot achievements.\n✅ = Owned achievement.")

    const record = await DatabaseMethods.GetUserRecord(user.id)
    const fields = await GetAchievementsFields()

    if (!record) {
        message.channel.send("User does not have a BankingBot account initialised!")
        return
    }

    embed.setFields(fields)

    if (!embed.data.fields) return
    const ownedAchievements = embed.data.fields.map(async (achievement) => {
        const achievementData = await DatabaseMethods.GetAchievementByName(achievement.name)
        if (achievementData && record.achievements.includes(achievementData.id)) achievement.name = `✅ ${achievementData.name}`
        return achievement
    })

    const resolved = await Promise.all(ownedAchievements)
    embed.setFields(resolved)

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
        const mention = message.mentions.members?.first()
        const author = message.author

        if (!mention) {
            await SendAchievementsEmbed(message, author)
            return
        }

        await SendAchievementsEmbed(message, mention.user)
    }
}

export default Cmd