import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js"
import Config from "../config"

const Gifs = [
    "https://c.tenor.com/ASPoZ-hJLNQAAAAd/caracal-big.gif",
    "https://c.tenor.com/kJm3ZmATrkwAAAAC/floppasit-floppa.gif",
    "https://c.tenor.com/oMUQNj9nTncAAAAd/floppa-big-floppa.gif",
    "https://c.tenor.com/bxETY3uE8qAAAAAd/floppa.gif",
    "https://c.tenor.com/0bfVP_kIl-8AAAAC/floppa-big-floppa.gif",
    "https://c.tenor.com/c0nqR17b06gAAAAd/flopa-floppa.gif",
    "https://c.tenor.com/N5rubedIYxwAAAAM/floppa.gif"
]

const Cmd: Command = {
    Name: "floppa",
    Description: "Sends a floppa GIF",
    Usage: `\`${Config.prefix}floppa\``,
    Listed: false,
    Invoke: async (client: Client, message: Message) => {
        const index = Math.floor(Math.random() * Gifs.length)
        const gif = Gifs[index]

        const embed = new EmbedBuilder()
        embed.setTitle("floppa!!!")
        embed.setColor("LuminousVividPink")
        embed.setImage(gif)

        message.channel.send({
            embeds: [embed]
        })
    }
}

export default Cmd