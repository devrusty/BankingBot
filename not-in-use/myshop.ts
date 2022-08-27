import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder, User } from "discord.js"
import * as DatabaseMethods from "../Database"
import { PersonalShop } from "@prisma/client";
import Config from "../config.json"

const RenderPersonalShopEmbed = async (user: User, shop: PersonalShop) => {
    const embed = new EmbedBuilder()
    embed.setTitle(`${user.tag}'s Shop`)
    embed.setColor("Red")
    embed.setFooter({
        text: `Want your own shop? Learn more about premium with \`${Config.prefix}help\` premium.`
    })

    return embed
}

const CreateShop = async (client: Client, message: Message) => {
    const author = message.author
    const shopExists = await DatabaseMethods.UserShopExists(author.id)

    if (shopExists) {
        message.channel.send(`You already have a shop! Use \`${Config.prefix}myshop\` to view details.`)
        return
    }

    await DatabaseMethods.CreateUserShop(author.id).then(() => {
        message.channel.send(`Successfully created your personal shop! Use \`${Config.prefix}myshop\` to view it.`)
    }).catch(e => {
        console.log(e)
        message.channel.send("An error occured while creating your personal shop. The error has been logged, please report it to bring our attention..")
    })
}

const Cmd: Command = {
    Name: "myshop",
    Description: "Premium only command that allows you to create and manage your personal shop.",
    Usage: `\`${Config.prefix}myshop ?create ?add ?remove <?item>\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const action = args[1]
        const author = message.author
        const isPremium = await DatabaseMethods.IsUserPremium(author.id)
        if (!isPremium) {
            message.channel.send(`You must be a premium member to use \`${Config.prefix}myshop\`. Learn more about BankingBot premium using \`${Config.prefix}help premium\`.`)
            return
        }

        // b!myshop create
        if (action && action.toLowerCase() == "create") {
            CreateShop(client, message)
            return
        }

        const shopExists = await DatabaseMethods.UserShopExists(author.id)
        if (!shopExists) {
            message.channel.send(`You do not have a personal shop. Use \`${Config.prefix}myshop create\` to create one.`)
            return
        }

        const shop = await DatabaseMethods.GetUserShop(author.id)
        if (!shop) {
            message.channel.send(`You do not have a personal shop. Use \`${Config.prefix}myshop create\` to create one.`)
            return
        }

        const shopEmbed = await RenderPersonalShopEmbed(author, shop)

        message.channel.send({
            embeds: [shopEmbed]
        })
    }
}

export default Cmd