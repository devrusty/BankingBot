import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder, User } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"

const RenderPersonalShopEmbed = async (user: User) => {
    const embed = new EmbedBuilder()
    return embed
}

const Cmd: Command = {
    Name: "myshop",
    Description: "Premium only command that allows you to create and manage your personal shop.",
    Usage: "b!myshop ?create ?manage ?add ?remove <?item>",
    Listed: true,
    Invoke: async (client: Client, message: Message) => {
        const author = message.author
        const isPremium = await DatabaseMethods.IsUserPremium(author)
        if (!isPremium) {
            message.channel.send("You must be a premium member to use `b!myshop`. Learn more about BankingBot premium using `b!help premium`.")
            return
        }

        const shopEmbed = await RenderPersonalShopEmbed(author)

        message.channel.send({
            embeds: [shopEmbed]
        })
    }
}

export default Cmd