import Command from "../interfaces/commandInterface";
import { Client, Message, User, EmbedBuilder } from "discord.js";
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";
import { GetLevelMaxXP } from "../methods/Levels";
import Config from "../config.json"

const DisplayAccountEmbed = async (message: Message, user: User) => {
    const record = await DatabaseMethods.GetUserRecord(user.id)
    if (!record) {
        message.channel.send(`${user.tag} does not have a BankingBot account initialised!`)
        return
    }

    const embed: EmbedBuilder = new EmbedBuilder()
    const balanceString = `$${FormatMoney(record?.cash)}`
    const occupation = await DatabaseMethods.GetJobNameById(record.occupation)

    embed.setTitle(`${user.tag}`)
    embed.setColor("Red")
    embed.setThumbnail(user.displayAvatarURL())
    embed.setFields(
        { name: "Balance", value: balanceString },
        { name: "Level", value: `${String(record.level)} (${record.xp}/${GetLevelMaxXP(record.level)})` },
        { name: "Occupation", value: occupation || "Unemployed" },
        { name: "Premium", value: String(record.premium) }
    )

    message.channel.send({
        embeds: [embed]
    })
}

const CreateAccount = async (message: Message) => {
    const recordExists: boolean = await DatabaseMethods.UserRecordExists(message.author.id)
    if (recordExists) {
        message.channel.send(`You already have a BankingBot account. Use \`${Config.prefix}account\` to view your balance.`)
        return
    }

    const newRecord: boolean = await DatabaseMethods.CreateUserRecord(message.author.id)
    if (!newRecord) {
        message.channel.send(`You already have a BankingBot account. Use \`${Config.prefix}account\` to view your balance.`)
        return
    }

    message.channel.send(`Account created! Use \`${Config.prefix}account\` to view your balance.`)
}

const DeleteAccount = async (message: Message) => {
    const author = message.author
    const id = author.id

    const recordExists = await DatabaseMethods.UserRecordExists(id)
    if (!recordExists) {
        message.channel.send(`You must have a BankingBot account initialised to delete an account! Use \`${Config.prefix}account create\``)
        return
    }

    await DatabaseMethods.DeleteUserRecord(id).then(() => {
        message.channel.send("Your BankingBot account has been successfully deleted.")
    }).catch((err) => {
        message.channel.send("An error occured")
    })
}

const Cmd: Command = {
    Name: "account",
    Description: "Shows information about your BankingBot account.",
    Usage: `\`${Config.prefix}account ?<@user> ?create\``,
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