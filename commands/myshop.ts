import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder, User } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import { PersonalShop } from "@prisma/client";

const RenderPersonalShopEmbed = async (user: User, shop: PersonalShop) => {
    const embed = new EmbedBuilder()
    return embed
}

const CreateShop = async (client: Client, message: Message) => {
    const author = message.author
    const shopExists = await DatabaseMethods.UserShopExists(author)
    console.log(shopExists)
    if (shopExists) {
        message.channel.send("You already have a shop! Use `b!myshop` to view details.")
        return
    }

    await DatabaseMethods.CreateUserShop(author).then(() => {
        message.channel.send("Successfully created your personal shop! Use `b!myshop` to view it.")
    }).catch(e => {
        console.log(e)
        message.channel.send("An error occured while creating your personal shop. Please report the bug.")
    })
}

const Cmd: Command = {
    Name: "myshop",
    Description: "Premium only command that allows you to create and manage your personal shop.",
    Usage: "b!myshop ?create ?manage ?add ?remove <?item>",
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const action = args[1]
        const author = message.author
        const isPremium = await DatabaseMethods.IsUserPremium(author)
        if (!isPremium) {
            message.channel.send("You must be a premium member to use `b!myshop`. Learn more about BankingBot premium using `b!help premium`.")
            return
        }

        // b!myshop create
        if (action.toLowerCase() == "create") {
            CreateShop(client, message)
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