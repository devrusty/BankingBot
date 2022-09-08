import Command from "../interfaces/Command";
import { Client, Message, EmbedBuilder } from "discord.js"
import Config from "../config"
import * as DatabaseMethods from "../Database"
import * as MessageTemplates from "../methods/MessageTemplates"
import { Item, User } from "@prisma/client";
import FormatMoney from "../methods/FormatMoney";
import Lootbox from "../interfaces/Lootbox";

const RecentlyUsed = new Set()
const Cooldown = 60000

const Lootboxes: Lootbox[] = [
    { name: "Common", emoji: "", price: 5000 },
    { name: "Uncommon", emoji: "", price: 10000 },
    { name: "Rare", emoji: "", price: 25000 },
    { name: "Ultra", emoji: "", price: 50000 },
    { name: "Legendary", emoji: "", price: 100000 },
    { name: "Godly", emoji: "", price: 500000 }
]

type Reward = "Item" | "Cash" | "XP"
const RewardTypes: Reward[] = ["Item", "Cash", "XP"]

interface RewardData {
    type: Reward,
    value: Item | number
}

const GetLootboxFields = () => {
    const fields = Lootboxes.map((lootbox) => {
        return {
            name: `${lootbox.emoji} ${lootbox.name}`,
            value: `$${FormatMoney(lootbox.price)}`,
            inline: true
        }
    })

    return fields
}

const GetLootboxItem = async (lootboxPrice: number) => {
    const rewardType = RewardTypes[Math.floor(Math.random() * RewardTypes.length)]
    const items = await DatabaseMethods.ItemMethods.GetItems()
    const rangedItems = items.filter((item) => {
        return item.price <= Math.floor(lootboxPrice / 2.5) && item.price > Math.floor(item.price / 100)
    })

    let reward: RewardData = { type: rewardType, value: 0 }
    switch (rewardType) {
        case "Cash":
            reward.value = Math.floor(Math.random() * lootboxPrice) + Math.floor(Math.random() * (lootboxPrice * 1.5))
            break
        case "XP":
            reward.value = Math.floor(Math.random() * lootboxPrice / 100) + Math.floor(Math.random() * lootboxPrice / 12)
            break
        case "Item":
            reward.value = rangedItems[Math.floor(Math.random() * rangedItems.length)]
            break
    }

    return reward
}

const OpenLootbox = async (client: Client, message: Message, args: string[]) => {
    const author = message.author
    const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
    if (RecentlyUsed.has(author)) {
        MessageTemplates.AssertCooldown(message, 1, "Minute")
        return
    }

    if (!record) {
        MessageTemplates.AssertAccountRequired(message)
        return
    }

    const lootboxName = args[2]
    if (!lootboxName) {
        message.channel.send("Please specify a lootbox to open.")
        return
    }

    const lootbox = Lootboxes.find((lootbox) => lootbox.name.toLowerCase() == lootboxName.toLowerCase())
    if (!lootbox) {
        message.channel.send("Lootbox doesn't exist.")
        return
    }

    if (record.cash < lootbox.price) {
        message.channel.send("You cannot afford that lootbox.")
        return
    }

    const embed = new EmbedBuilder()
    embed.setTitle(`Lootbox Opening - ${lootbox.name}`)
    embed.setColor(Config.embedColor)
    embed.setDescription(`Opening  lootbox ${lootbox.name}.`)

    const reward = await GetLootboxItem(lootbox.price)
    switch (reward.type) {
        case "Cash":
            const cash = (reward.value as number)
            await DatabaseMethods.UserMethods.AddToBalance(author.id, cash).then(() => {
                embed.setFields({ name: "Reward", value: `$${FormatMoney(cash)}` })
            })
            break
        case "XP":
            const xp = (reward.value as number)
            await DatabaseMethods.UserMethods.GiveXP(author.id, xp).then(() => {
                embed.setFields({ name: "Reward", value: `${FormatMoney(xp)} XP` })
            })
            break
        case "Item":
            const item = (reward.value as Item)
            if (!item) {
                message.channel.send("The item that you won does not exist. You weren't charged.")
                return
            }

            if (record.inventory.includes(item.id)) {
                const value = Math.floor(item.price / 2)
                await DatabaseMethods.UserMethods.AddToBalance(author.id, value).then(() => {
                    message.channel.send(`You already have a ${item.name}, but you were rewarded $${FormatMoney(value)}`)
                })
                return
            }

            record.inventory.push(item.id)
            await DatabaseMethods.UserMethods.SetUser(author.id, record).then(() => {
                embed.setFields({ name: "Reward", value: `${item.name} ($${FormatMoney(item.price)})` })
            })
            break
    }

    await DatabaseMethods.UserMethods.RemoveFromBalance(author.id, lootbox.price).then(() => {
        message.channel.send({
            embeds: [embed]
        })
    })

    RecentlyUsed.add(author)
    setTimeout(() => {
        RecentlyUsed.delete(author)
    }, Cooldown);
}

const DisplayLootboxes = (message: Message) => {
    const embed = new EmbedBuilder()
    embed.setTitle("Lootboxes")
    embed.setDescription(`Choose a lootbox with \`${Config.prefix}lootbox buy <lootbox>\`.`)
    embed.setColor(Config.embedColor)
    embed.setFooter({
        text: "This feature is new and may have issues or bugs. Please report them in the official BankingBot Discord server."
    })
    embed.setFields(GetLootboxFields())

    message.channel.send({
        embeds: [embed]
    })
}

const Cmd: Command = {
    Name: "lootbox",
    Description: "Allows you to purchase a lootbox, which gives you a random reward.",
    Usage: `\`${Config.prefix}lootbox\``,
    Aliases: ["box"],
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        let arg = args[1]
        if (!arg) {
            DisplayLootboxes(message)
            return
        }

        arg = arg.toLowerCase()
        if (arg == "buy") {
            await OpenLootbox(client, message, args)
            return
        }
    }
}

export default Cmd