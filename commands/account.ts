import Command from "../interfaces/Command";
import { Client, Message, User, EmbedBuilder, Embed } from "discord.js";
import * as DatabaseMethods from "../Database"
import FormatMoney from "../methods/FormatMoney";
import { GetLevelMaxXP } from "../methods/Levels";
import Config from "../config"
import * as MessageTemplates from "../methods/MessageTemplates"
import GetBooleanEmoji from "../methods/GetBooleanEmoji";

const DisplayAccountEmbed = async (message: Message, user: User) => {
    const record = await DatabaseMethods.UserMethods.GetUserRecord(user.id)
    if (!record) {
        message.channel.send(`<@${user.id}> does not have a BankingBot account initialised!`)
        return
    }

    const embed: EmbedBuilder = new EmbedBuilder()
    const balanceString = `$${FormatMoney(record?.cash)}`
    const occupation = await DatabaseMethods.JobMethods.GetJobNameById(record.occupation)

    embed.setTitle(`${user.tag}`)
    embed.setColor("Red")
    embed.setThumbnail(user.displayAvatarURL())
    if (record.banned) embed.addFields(
        { name: "Banned", value: "This user is banned from BankingBot." }
    )

    const xp = FormatMoney(record.xp)
    const maxRp = FormatMoney(GetLevelMaxXP(record.level))

    embed.addFields(
        { name: "Balance", value: balanceString },
        { name: "Level", value: `${String(record.level)} (${xp}/${maxRp})` },
        { name: "Occupation", value: occupation || "Unemployed" },
        { name: "Premium", value: GetBooleanEmoji(record.premium) }
    )

    if (record.achievements.includes(9)) embed.data.title = `${embed.data.title} BB`
    if (record.verified) embed.data.title = `${embed.data.title} ✅`
    if (record.premium) embed.data.title = `${embed.data.title} 💎`
    if (record.achievements.includes(2)) embed.data.title = `${embed.data.title} 🛠️`

    message.channel.send({
        embeds: [embed]
    })
}

const CreateAccount = async (message: Message) => {
    const recordExists: boolean = await DatabaseMethods.UserMethods.UserRecordExists(message.author.id)
    if (recordExists) {
        message.channel.send(`You already have a BankingBot account. Use \`${Config.prefix}account\` to view your profile.`)
        return
    }

    await DatabaseMethods.UserMethods.CreateUserRecord(message.author.id).then(() => {
        message.channel.send(`Account created! Use \`${Config.prefix}account\` to view your profile.`)
    })
}

const DeleteAccount = async (message: Message) => {
    const author = message.author
    const id = author.id

    const recordExists = await DatabaseMethods.UserMethods.UserRecordExists(id)
    if (!recordExists) {
        MessageTemplates.AssertAccountRequired(message)
        return
    }

    await DatabaseMethods.UserMethods.DeleteUserRecord(id).then(() => {
        message.channel.send("Your BankingBot account has been successfully deleted.")
    }).catch((err) => {
        message.channel.send("An error occured")
    })
}

const Cmd: Command = {
    Name: "account",
    Description: "Shows information about your BankingBot account.",
    Usage: `\`${Config.prefix}account\``,
    Aliases: ["profile"],
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const mention = message.mentions.users.first()
        let param = args[1]

        if (!param) {
            await DisplayAccountEmbed(message, message.author)
            return
        }

        param = param.toLowerCase().replace(/ g/, "")

        if (param == "create") {
            await CreateAccount(message)
            return
        }

        if (param == "delete") {
            await DeleteAccount(message)
            return
        }

        if (!mention) {
            message.channel.send("Invalid member.")
            return
        }

        DisplayAccountEmbed(message, mention)
    }
}

export default Cmd