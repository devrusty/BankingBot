import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js"
import Config from "../config"
import * as DatabaseMethods from "../Database"
import * as MesasgeTemplates from "../methods/MessageTemplates"
import { User } from "@prisma/client";
import FormatMoney from "../methods/FormatMoney";

const DisplayUserQuestx = async (record: User, message: Message) => {
    const quests = record.quests
    const embed = new EmbedBuilder()
    embed.setTitle("Quests")
    if (quests.length == 0) embed.setDescription("You do not have any active quests at the moment.")
    embed.setColor(Config.embedColor)

    const fields = quests.map(async (id) => {
        const quest = await DatabaseMethods.GetQuestById(id)
        if (!quest) return { name: "Unknown Quest", value: "There was an issue while fetching this quest's data.", inline: true }

        const questRewardType = quest.rewardType
        let reward

        switch (questRewardType) {
            case "Cash":
                reward = `$${FormatMoney(quest.reward)}`
                break
            case "XP":
                reward = `${FormatMoney(quest.reward)} XP`
                break
            case "Item":
                const item = await DatabaseMethods.GetItemById(quest.reward)
                if (item) reward = item.name
                break
        }

        return { name: quest.name, value: `Reward: $${reward}`, inline: true }
    })

    const resolved = await Promise.all(fields)
    embed.setFields(resolved)

    message.channel.send({
        embeds: [embed]
    })
}

const Cmd: Command = {
    Name: "quests",
    Description: "Shows all of your active quests.",
    Usage: `\`${Config.prefix}quests\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const record = await DatabaseMethods.GetUserRecord(author.id)
        if (!record) {
            MesasgeTemplates.AssertAccountRequired(message)
            return
        }

        DisplayUserQuestx(record, message)
    }
}

export default Cmd