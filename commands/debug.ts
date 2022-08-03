import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import Config from "../config.json"

const AddMoney = async (message: Message, args: string[]) => {
    const author = message.author
    const mention = message.mentions.members?.first()

    if (!mention) {
        const amount = args[2]
        const recordExists = await DatabaseMethods.UserRecordExists(author)
        if (!recordExists) {
            message.channel.send("Please use `b!account create`.")
            return
        }

        if (!amount) {
            message.channel.send("Please specify an amount to give.")
            return
        }

        await DatabaseMethods.AddToBalance(author, Number(amount)).then(() => {
            message.channel.send(`Gave $${amount} to ${author.tag}`)
        })
        return
    }

    const amount = args[3]
    const recordExists = await DatabaseMethods.UserRecordExists(mention.user)
    if (!recordExists) {
        message.channel.send("The user that you're trying to give money to does not have a BankingBot account initialised.")
        return
    }

    if (!amount) {
        message.channel.send("Please specify an amount to give.")
        return
    }

    await DatabaseMethods.AddToBalance(mention.user, Number(amount)).then(() => {
        message.channel.send(`Gave $${amount} to ${mention.user.tag}`)
    })
}

const ClearMoney = async (message: Message, args: string[]) => {
    const author = message.author
    const mention = message.mentions.members?.first()

    if (!mention) {
        const recordExists = await DatabaseMethods.UserRecordExists(author)
        if (!recordExists) {
            message.channel.send("Please use `b!account create`.")
            return
        }

        const record = await DatabaseMethods.GetUserRecord(author)
        if (!record) {
            message.channel.send("Please use `b!account create`.")
            return
        }

        await DatabaseMethods.RemoveFromBalance(author, record.cash).then(() => {
            message.channel.send(`Cleared ${author.tag}'s cash.`)
        })
        return
    }

    const record = await DatabaseMethods.GetUserRecord(mention.user)
    if (!record) {
        message.channel.send("The user that you're trying to clear does not have a BankingBot account initialised.")
        return
    }

    await DatabaseMethods.RemoveFromBalance(mention.user, record.cash).then(() => {
        message.channel.send(`Cleared ${mention.user.tag}'s cash.`)
    })
}

const Cmd: Command = {
    Name: "debug",
    Description: "Debug commands that are only avaliable to the creator of BankingBot.",
    Usage: "`b!debug`",
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author

        if (!Config.developers.includes(author.id)) {
            message.channel.send("You are not allowed to use `b!debug`.")
            return
        }

        let action = args[1]

        if (!action) {
            const infoEmbed = new EmbedBuilder()
            infoEmbed.setTitle("BankingBot Debugging")
            infoEmbed.setColor("Red")
            infoEmbed.setDescription("`b!debug` is a command that is only avaliable to developers of BankingBot.")
            infoEmbed.addFields(
                { name: "Adding Money", value: "`b!debug add_money @user 100`", inline: true },
                { name: "Clearing Money", value: "`b!debug clear_money @user`", inline: true },
                { name: "Crashing", value: "`b!debug stop`", inline: true }
            )

            message.channel.send({
                embeds: [infoEmbed]
            })

            return
        }

        action = action.toLowerCase()

        if (action == "stop") process.exit(1)
        if (action == "add_money") {
            await AddMoney(message, args)
            return
        }
        if (action == "clear_money") {
            await ClearMoney(message, args)
            return
        }
    }
}

export default Cmd