import Config from "../config"
import { Message } from "discord.js"

export function AssertAccountRequired(message: Message) {
    message.channel.send(`You must have a BankingBot account initialised. Please use \`${Config.prefix}account create\`.`)
}

type TimeUnit = "Millisecond" | "Second" | "Hour" | "Day" | "Minute"
export function AssertCooldown(message: Message, count: number, unit: TimeUnit) {
    const plural = count > 1 ? "s" : ""
    message.channel.send(`Please wait ${count} ${unit.toLowerCase()}${plural} before using that command again.`)
}