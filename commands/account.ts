import Command from "../interfaces/commandInterface";
import { Client, Message, User, EmbedBuilder, GuildEmoji } from "discord.js";
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";

const DisplayAccountEmbed = async (message: Message, user: User) => {
    const record = await DatabaseMethods.GetUserRecord(user)
    if (!record) {
        message.channel.send(`${user.tag} does not have a BankingBot account initialised!`)
        return
    }

    const embed: EmbedBuilder = new EmbedBuilder()
    const balanceString = `$${FormatMoney(record?.cash)}`

    embed.setTitle(`${user.tag}`)
    embed.setColor("Red")
    embed.setThumbnail(user.displayAvatarURL())
    embed.setFields(
        { name: "Balance", value: balanceString },
        { name: "Premium", value: String(record?.premium) }
    )

    message.channel.send({
        embeds: [embed]
    })
}

const CreateAccount = async (message: Message) => {
    const recordExists: boolean = await DatabaseMethods.UserRecordExists(message.author)
    if (recordExists) {
        message.channel.send("You already have a BankingBot account. Use `b!balance` to view your balance.")
        return
    }

    const newRecord: boolean = await DatabaseMethods.CreateUserRecord(message.author)
    if (!newRecord) {
        message.channel.send("You already have a BankingBot account. Use `b!balance` to view your balance.")
        return
    }

    message.channel.send("Account created! Use `b!balance` to view your balance.")
}

const Cmd: Command = {
    Name: "account",
    Description: "Shows information about your BankingBot account.",
    Usage: `b!account`,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const mention = message.mentions.users.first()
        let param = args[1]

        if (!param) {
            await DisplayAccountEmbed(message, message.author)
            return
        }

        param = param.toLowerCase()

        if (param == "create") {
            await CreateAccount(message)
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