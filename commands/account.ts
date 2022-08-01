import Command from "../interfaces/commandInterface";
import { Client, Message, User } from "discord.js";
import * as DatabaseMethods from "../databaseMethods"
import { EmbedBuilder } from "discord.js";
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

const Cmd: Command = {
    Name: "account",
    Description: "Shows information about your BankingBot account.",
    Usage: `b!account`,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const mention = message.mentions.users.first()

        if (!message.mentions.users.first()) {
            DisplayAccountEmbed(message, message.author)
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