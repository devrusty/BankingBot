import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js";
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";

const DisplayAllJobs = async (message: Message) => {
    const jobs = await DatabaseMethods.GetJobs()
    const jobsEmbed = new EmbedBuilder()
    jobsEmbed.setTitle("Jobs")
    jobsEmbed.setColor("Red")

    const fields = jobs.map(job => {
        return {
            name: job.name,
            value: `About: ${job.description}\nIncome: $${FormatMoney(job.income)}`,
            inline: true
        }
    })

    jobsEmbed.addFields(fields)

    message.channel.send({
        embeds: [jobsEmbed]
    })
}

const DisplayJobsForLevel = async (message: Message, level: number) => {
    const jobs = await DatabaseMethods.GetJobsForLevel(level)
    const jobsEmbed = new EmbedBuilder()
    jobsEmbed.setTitle("Jobs")
    jobsEmbed.setColor("Red")

    const fields = jobs.map(job => {
        return {
            name: job.name,
            value: `About: ${job.description}\nIncome: $${FormatMoney(job.income)}`,
            inline: true
        }
    })

    jobsEmbed.addFields(fields)

    message.channel.send({
        embeds: [jobsEmbed]
    })
}

const Cmd: Command = {
    Name: "jobs",
    Description: "Lists all avaliable jobs for the user's level.",
    Usage: "`b!jobs`",
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        const recordExists = await DatabaseMethods.UserRecordExists(author)

        if (!recordExists) {
            await DisplayAllJobs(message)
            return
        }

        const record = await DatabaseMethods.GetUserRecord(author)
        if (!record) {
            await DisplayAllJobs(message)
            return
        }

        await DisplayJobsForLevel(message, record.level)
    }
}

export default Cmd