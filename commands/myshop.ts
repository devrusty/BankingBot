import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder, User } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import { PersonalShop } from "@prisma/client";

const RenderPersonalShopEmbed = async (user: User, shop: PersonalShop) => {
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

        const shopExists = await DatabaseMethods.UserShopExists(author)
        if (!shopExists) {
            message.channel.send("You do not have a personal shop. Use `b!myshop create` to create one.")
            return
        }

        const shop = await DatabaseMethods.GetUserShop(author)
        if (!shop) {
            message.channel.send("You do not have a personal shop. Use `b!myshop create` to create one.")
            return
        }

        const shopEmbed = await RenderPersonalShopEmbed(author, shop)

        message.channel.send({
            embeds: [shopEmbed]
        })
    }
}

export default Cmd