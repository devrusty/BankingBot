import Command from "../interfaces/Command";
import { Client, Message } from "discord.js"
import Config from "../config"

const GIFs = [
    "https://tenor.com/view/beaver-canada-canada-beaver-beaver-canada-canadian-beaver-gif-22083226",
    "https://tenor.com/view/beaver-gif-20588996",
    "https://tenor.com/view/castor-wheels-beaver-castor-apple-beavers-gif-25629060",
    "https://tenor.com/view/beaver-beaver-fail-castor-castorwheels-silly-gif-25630883",
    "https://tenor.com/view/beaver-dam-building-wildlife-working-gif-3471461",
    "https://tenor.com/view/beaver-carrying-hurry-%D0%B1%D0%BE%D0%B1%D0%B5%D1%80-carrots-gif-25255221",
    "https://tenor.com/view/beaver-wave-hi-notice-me-gif-8946820",
    "https://tenor.com/view/zombeavers-bite-attack-scary-animal-gif-16263539",
    "https://tenor.com/view/wild-beaver-viralhog-waddle-walk-stand-uo-gif-20164080",
    "https://tenor.com/view/beaver-beaver-my-beloved-i-love-beaver-gray-loves-beaver-gif-23428697",
    "https://tenor.com/view/stress-cabbage-beaver-eating-cabbages-gif-19336743",
    "https://tenor.com/view/beaver-im-out-good-bye-bye-escape-gif-18464011",
    "https://tenor.com/view/beaver-hi-gif-21291049",
    "https://tenor.com/view/beaver-dis-beav-gif-7946008",
    "https://tenor.com/view/bober-gryzie-b%C3%B3br-bobr-chuj-gif-16349585",
    "https://tenor.com/view/beaver-ice-break-breaker-icebreaker-gif-18984374",
    "https://tenor.com/view/babybeaver-beaver-%D0%B1%D0%BE%D0%B1%D1%80%D0%B8%D0%BA-%D0%B1%D0%BE%D0%B1%D1%80-%D1%83%D0%BF%D0%B0%D0%BB-gif-25409099"
]

const Cmd: Command = {
    Name: "beaver",
    Description: "Sends a random gif of a beaver.",
    Usage: `\`${Config.prefix}beaver\``,
    Listed: false,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const index = Math.floor(Math.random() * GIFs.length)
        const gif = GIFs[index]

        message.channel.send(gif)
    }
}

export default Cmd