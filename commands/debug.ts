import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js"
import * as DatabaseMethods from "../Database"
import Config from "../config.json"
import { Bot } from "../index"

const AddMoney = async (message: Message, args: string[]) => {
    const author = message.author
    const mention = message.mentions.members?.first()

    if (!mention) {
        const amount = args[2]
        const recordExists = await DatabaseMethods.UserRecordExists(author.id)
        if (!recordExists) {
            message.channel.send(`Please use \`${Config.prefix}account create\`.`)
            return
        }

        if (!amount) {
            message.channel.send("Please specify an amount to give.")
            return
        }

        await DatabaseMethods.AddToBalance(author.id, Number(amount)).then(() => {
            message.channel.send(`Gave $${amount} to ${author.tag}`)
        })
        return
    }

    const amount = args[3]
    const recordExists = await DatabaseMethods.UserRecordExists(mention.user.id)
    if (!recordExists) {
        message.channel.send("The user that you're trying to give money to does not have a BankingBot account initialised.")
        return
    }

    if (!amount) {
        message.channel.send("Please specify an amount to give.")
        return
    }

    await DatabaseMethods.AddToBalance(mention.user.id, Number(amount)).then(() => {
        message.channel.send(`Gave $${amount} to ${mention.user.tag}`)
    })
}

const ClearMoney = async (message: Message, args: string[]) => {
    const author = message.author
    const mention = message.mentions.members?.first()

    if (!mention) {
        const recordExists = await DatabaseMethods.UserRecordExists(author.id)
        if (!recordExists) {
            message.channel.send(`Please use \`${Config.prefix}account create\`.`)
            return
        }

        const record = await DatabaseMethods.GetUserRecord(author.id)
        if (!record) {
            message.channel.send(`Please use \`${Config.prefix}account create\`.`)
            return
        }

        await DatabaseMethods.RemoveFromBalance(author.id, record.cash).then(() => {
            message.channel.send(`Cleared ${author.tag}'s cash.`)
        })
        return
    }

    const record = await DatabaseMethods.GetUserRecord(mention.user.id)
    if (!record) {
        message.channel.send("The user that you're trying to clear does not have a BankingBot account initialised.")
        return
    }

    await DatabaseMethods.RemoveFromBalance(mention.user.id, record.cash).then(() => {
        message.channel.send(`Cleared ${mention.user.tag}'s cash.`)
    })
}

const GetUptime = (message: Message) => {
    const uptimeMs = Bot.uptime
    if (!uptimeMs) {
        message.channel.send("`client.uptime` is undefined.")
        return
    }

    let seconds = Math.floor(uptimeMs / 1000)
    interface Uptime {
        days: number,
        hours: number,
        minutes: number,
        seconds: number
    }

    let time: Uptime = {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    }

    time.days = Math.floor(seconds / 86400);
    seconds %= 86400;
    time.hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    time.minutes = Math.floor(seconds / 60);
    time.seconds = Math.floor(seconds % 60);

    message.channel.send(`${time.days}d, ${time.hours}h, ${time.minutes}m, ${time.seconds}s`)
}

const Ban = async (message: Message) => {
    const mention = message.mentions.members?.first()
    if (!mention) {
        message.channel.send("Please mention a valid member.")
        return
    }

    const record = await DatabaseMethods.GetUserRecord(mention.id)
    if (!record) {
        message.channel.send("The user you're trying to ban does not have a BankingBot account initialised.")
        return
    }

    if (record.banned) {
        message.channel.send("The user you're trying to ban is already banned!")
        return
    }

    await DatabaseMethods.BanUser(mention.id).then(() => {
        message.channel.send(`<@${mention.id}> has been banned from using BankingBot.`)
    }).catch((err) => {
        console.log(err)
        message.channel.send("There was an error while banning the user.")
    })
}

const Pardon = async (message: Message) => {
    const mention = message.mentions.members?.first()
    if (!mention) {
        message.channel.send("Please mention a valid member.")
        return
    }

    const record = await DatabaseMethods.GetUserRecord(mention.id)
    if (!record) {
        message.channel.send("The user you're trying to pardon does not have a BankingBot account initialised!")
        return
    }

    if (!record.banned) {
        message.channel.send("The user you're trying to pardon is not banned.")
        return
    }

    await DatabaseMethods.PardonUser(mention.id).then(() => {
        message.channel.send(`Successfully pardoned <@${mention.id}>!`)
    }).catch((err) => {
        console.log(err)
        message.channel.send("There was an error while pardoning that user!")
    })
}

const Premium = async (message: Message) => {
    const user = message.mentions.members?.first()
    if (!user) {
        message.channel.send("Please mention a user.")
        return
    }

    const record = await DatabaseMethods.GetUserRecord(user.id)
    if (!record) {
        message.channel.send("User does not have a BankingBot account initialised.")
        return
    }

    record.premium = record.premium ? false : true
    await DatabaseMethods.SetUser(user.id, record).then(async () => {
        if (record.premium) {
            message.channel.send(`<@${user.id}> is now premium.`)
            await DatabaseMethods.AwardAchievement(user.id, "Premium")
            return
        }

        message.channel.send(`<@${user.id}> is no longer premium.`)
    })
}

const Award = async (message: Message, args: string[]) => {
    const mention = message.mentions.members?.first()
    if (!mention) {
        message.channel.send("Please mention a valid user.")
        return
    }

    const record = await DatabaseMethods.GetUserRecord(mention.user.id)
    if (!record) {
        message.channel.send("User does not have a BankingBot account initialised.")
        return
    }

    const achievementName = args.slice(3).join(" ").toLowerCase()
    const achievement = await DatabaseMethods.GetAchievementByName(achievementName)
    if (!achievement) {
        console.log(achievementName)
        message.channel.send("Invalid achievement.")
        return
    }

    await DatabaseMethods.AwardAchievement(mention.user.id, achievement.name).then(() => {
        message.channel.send(`Awarded <@${mention.user.id}> ${achievement.name}!`)
    })
}

const Cmd: Command = {
    Name: "debug",
    Description: "Debug commands that are only avaliable to the creator of BankingBot.",
    Usage: `\`${Config.prefix}debug\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author

        if (!Config.developers.includes(author.id)) {
            message.channel.send(`You are not allowed to use \`${Config.prefix}debug\`.`)
            return
        }

        let action = args[1]

        if (!action) {
            const infoEmbed = new EmbedBuilder()
            infoEmbed.setTitle("BankingBot Debugging")
            infoEmbed.setColor("Red")
            infoEmbed.setDescription(`\`${Config.prefix}debug\` is a command that is only avaliable to developers of BankingBot.`)
            infoEmbed.addFields(
                { name: "Adding Money", value: `\`${Config.prefix}debug add_money\``, inline: true },
                { name: "Clearing Money", value: `\`${Config.prefix}debug clear_money\``, inline: true },
                { name: "Crashing", value: `\`${Config.prefix}debug stop\``, inline: true },
                { name: "Uptime", value: `\`${Config.prefix}debug uptime\``, inline: true },
                { name: "Ban/Pardon", value: `\`${Config.prefix}debug ban\` \`${Config.prefix}debug pardon\``, inline: true },
                { name: "Premium", value: `\`${Config.prefix}debug premium\``, inline: true }
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
        if (action == "uptime") {
            GetUptime(message)
            return
        }
        if (action == "ban") {
            await Ban(message)
            return
        }

        if (action == "pardon") {
            await Pardon(message)
            return
        }

        if (action == "premium") {
            await Premium(message)
            return
        }

        if (action == "award") {
            await Award(message, args)
            return
        }
    }
}

export default Cmd