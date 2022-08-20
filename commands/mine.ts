import Command from "../interfaces/commandInterface";
import Config from "../config.json"
import { Client, Message } from "discord.js"
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";

const RecentlyUsed = new Set()
const Minerals = {
    Coal: 100,
    Iron: 250,

}
const Cooldown = 3600000

const Mine = () => {
    let mined = new Array()
    let minedCount = Math.floor(Math.random() * 15)
    for (var i = 0; i < minedCount; i++) {
        const keys = Object.keys(Minerals)
        const index = Math.floor(Math.random() * keys.length)
        const mineral = keys[index]

        mined.push(mineral)
    }

    return mined
}

const Cmd: Command = {
    Name: "mine",
    Description: "",
    Usage: `\`${Config.prefix}mine\``,
    Listed: true,
    Invoke: async (client: Client, message: Message) => {
        const author = message.author
        const record = await DatabaseMethods.GetUserRecord(author.id)
        if (RecentlyUsed.has(author.id)) {
            message.channel.send("You must wait an hour before mining again.")
            return
        }

        if (!record) {
            message.channel.send(`You must have a BankingBot account initialised to mine! Use \`${Config.prefix}account create\` to create one.`)
            return
        }

        const inventory = record.inventory
        if (!inventory.includes(16)) {
            message.channel.send("You must own a pickaxe to mine.")
            return
        }

        const mineralsMined = Mine()
        let value = 0

        mineralsMined.forEach((mineral) => {
            const price = (Minerals as any)[mineral]
            value += price
        })

        const xp = Math.floor(value / 10)

        await DatabaseMethods.AddToBalance(author.id, value).then(async () => {
            await DatabaseMethods.GiveXP(author.id, xp).then(() => {
                message.channel.send(`You went mining and earned $${FormatMoney(value)} and ${xp} XP!`)
                RecentlyUsed.add(author.id)

                setTimeout(() => {
                    RecentlyUsed.delete(author.id)
                }, Cooldown)
            })
        })
    }
}

export default Cmd