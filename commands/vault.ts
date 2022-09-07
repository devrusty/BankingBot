import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder, User, ReactionUserManager } from "discord.js"
import * as DatabaseMethods from "../Database"
import Config from "../config"
import * as MessageTemplates from "../methods/MessageTemplates"
import FormatMoney from "../methods/FormatMoney";

const Time = new Map<string, number>()
const Rate = 250
const Capacity = 40000

const SendCurrentVault = (message: Message, user: User) => {
    const time = Time.get(user.id)
    if (!time) {
        message.channel.send("There isn't any money in your vault.")
        return
    }

    const miliseconds = Math.floor(Date.now() - time)
    const seconds = (miliseconds / 1000)

    let amount = Math.floor(seconds * Rate)
    if (amount > Capacity) amount = Capacity

    const embed = new EmbedBuilder()
    embed.setTitle(`${user.tag}'s Vault`)
    embed.setDescription(`Use \`${Config.prefix}vault cashout\` to recieve your money.`)
    embed.setFields(
        { name: "Amount", value: `$${FormatMoney(amount)}/$${FormatMoney(Capacity)}`, inline: true }
    )
    embed.setColor(Config.embedColor)

    if (amount == Capacity)
        embed.setFooter({
            text: `Your vault is currently full and will not generate anymore cash. Use ${Config.prefix}vault cashout to recieve your vault's cash.`
        })

    message.channel.send({
        embeds: [embed]
    })
}

const Cashout = async (client: Client, message: Message, args: string[]) => {
    const author = message.author
    const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
    if (!record) {
        MessageTemplates.AssertAccountRequired(message)
        return
    }

    const time = Time.get(author.id)
    if (!time) {
        message.channel.send("There isn't any money in your vault.")
        return
    }

    const miliseconds = Math.floor(Date.now() - time)
    const seconds = (miliseconds / 1000)
    let amount = Math.floor(seconds * Rate)

    if (amount > Capacity) amount = Capacity

    await DatabaseMethods.UserMethods.AddToBalance(author.id, amount).then(() => {
        message.channel.send(`Successfully claimed $${FormatMoney(amount)} from your vault.`)
        Time.set(author.id, Date.now())
    })
}

const Cmd: Command = {
    Name: "vault",
    Description: "Passive income vault that gives you money over time.",
    Usage: `\`${Config.prefix}vault\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const record = await DatabaseMethods.UserMethods.GetUserRecord(author.id)
        let param = args[1]

        if (!param) {
            if (!record) {
                MessageTemplates.AssertAccountRequired(message)
                return
            }

            if (!record.inventory.includes(31)) {
                message.channel.send(`You must have a vault to use that command. Use \`${Config.prefix}shop buy Vault\`.`)
                return
            }

            let time = Time.get(author.id)
            if (!time) {
                Time.set(author.id, Date.now())
                message.channel.send(`Successfully initialised vault. Use \`${Config.prefix}vault\` to view it.`)
                return
            }

            SendCurrentVault(message, author)
            return
        }

        param = param.toLowerCase()

        if (param == "cashout") {
            await Cashout(client, message, args)
            return
        }
    }
}

export default Cmd