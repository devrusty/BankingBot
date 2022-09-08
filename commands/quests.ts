import Command from "../interfaces/Command";
import { Client, Message, EmbedBuilder } from "discord.js"
import Config from "../config"
import * as DatabaseMethods from "../Database"
import * as MesasgeTemplates from "../methods/MessageTemplates"
import { User } from "@prisma/client";
import FormatMoney from "../methods/FormatMoney";

const Compensation = 25000

const DisplayUserQuestx = async (record: User, message: Message) => {
    const quests = record.quests
    const embed = new EmbedBuilder()
    embed.setTitle("Quests")
    if (quests.length == 0) embed.setDescription("You do not have any active quests at the moment.")
    embed.setColor(Config.embedColor)

    const activeQuestFields = quests.map(async (id) => {
        const quest = await DatabaseMethods.QuestMethods.GetQuestById(id)
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
                const item = await DatabaseMethods.ItemMethods.GetItemById(quest.reward)
                if (item) reward = item.name
                break
        }

        return { name: quest.name, value: `Reward: $${reward}`, inline: true }
    })

    const awaitingQuestFields = record.awaitingQuests.map(async (id) => {
        const quest = await DatabaseMethods.QuestMethods.GetQuestById(id)
        if (quest) return { name: `✅ ${quest.name}`, value: `This quest has been completed. Use \`${Config.prefix}quests claim\` to claim the reward.` }
        return { name: "Unknown", value: `There was an issue while fetching the data for quest ID ${id}. Please report this to the developers.`, inline: true }
    })

    const resolvedActive = await Promise.all(activeQuestFields)
    const resolvedAwaiting = await Promise.all(awaitingQuestFields)

    embed.addFields(resolvedAwaiting)
    embed.addFields(resolvedActive)

    message.channel.send({
        embeds: [embed]
    })
}

const ClaimQuestReward = async (record: User, message: Message) => {
    const author = message.author
    const awaitingQuests = record.awaitingQuests
    if (awaitingQuests.length == 0) {
        message.channel.send("You do not have any awaiting quests.")
        return
    }

    const id = awaitingQuests[0]
    const quest = await DatabaseMethods.QuestMethods.GetQuestById(id)
    if (!quest) {
        message.channel.send(`There was an error while fetching quest data for ID ${id}. Please report this to the developers.`)
        return
    }

    const rewardType = quest.rewardType
    const reward = quest.reward

    await DatabaseMethods.QuestMethods.RemoveAwaitingQuest(author.id, quest.id)
    switch (rewardType) {
        case "Cash":
            await DatabaseMethods.UserMethods.AddToBalance(author.id, reward).then(() => {
                message.channel.send(`Successfully collected reward of $${FormatMoney(reward)} for completing ${quest.name}!`)
            })
            break
        case "Item":
            const itemData = await DatabaseMethods.ItemMethods.GetItemById(reward)
            if (!itemData) {
                await DatabaseMethods.UserMethods.AddToBalance(author.id, Compensation).then(() => {
                    message.channel.send(`The item reward does not exist. You have been compensated with $${FormatMoney(Compensation)} instead.`)
                })
                return
            }

            record.inventory.push(reward)
            await DatabaseMethods.UserMethods.SetUser(author.id, record)
            break
        case "XP":
            await DatabaseMethods.UserMethods.GiveXP(author.id, reward).then(() => {
                message.channel.send(`Successfully collected reward of ${FormatMoney(reward)} XP for completing ${quest.name}! `)
            })
            break
    }
}

const Cmd: Command = {
    Name: "quests",
    Description: "Shows all of your active quests.",
    Usage: `\`${Config.prefix}quests\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
        if (!record) {
            MesasgeTemplates.AssertAccountRequired(message)
            return
        }

        let param = args[1]
        if (!param) {
            DisplayUserQuestx(record, message)
            return
        }

        param = param.toLowerCase()
        if (param == "claim") {
            await ClaimQuestReward(record, message)
            return
        }
    }
}

export default Cmd