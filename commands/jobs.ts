import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js";
import * as DatabaseMethods from "../databaseMethods"
import FormatMoney from "../methods/FormatMoney";

const RecentlyWorked = new Set()

const DisplayJobsForLevel = async (message: Message, level: number) => {
    const jobs = await DatabaseMethods.GetJobsForLevel(level)
    const jobsEmbed = new EmbedBuilder()
    jobsEmbed.setTitle("Jobs")
    jobsEmbed.setColor("Red")

    const fields = jobs.map(job => {
        return {
            name: job.name,
            value: `Description: ${job.description}\nIncome: $${FormatMoney(job.income)}\nLevel: ${job.requiredLevel}`,
            inline: true
        }
    })

    jobsEmbed.addFields(fields)

    message.channel.send({
        embeds: [jobsEmbed]
    })
}

const GetJob = async (message: Message, args: string[]) => {
    const author = message.author
    const record = await DatabaseMethods.GetUserRecord(author)

    if (!record) {
        message.channel.send("You do not have a BankingBot account initialised! Use `b!account create` to create one.")
        return
    }

    const currentOccupation = await DatabaseMethods.GetJobById(record.occupation)
    if (currentOccupation) {
        message.channel.send("You currently have a job! Please use `b!jobs resign` to quit your job before changing it.")
        return
    }

    const jobName = args.slice(2).join(" ")
    if (!jobName) {
        message.channel.send("Please specify a job.")
        return
    }

    const jobs = await DatabaseMethods.GetJobs()

    if (!jobs.find(job => job.name.toLowerCase() == jobName.toLowerCase())) {
        message.channel.send("Invalid job. Please use `b!jobs` to see a list of avaliable jobs for your level.")
        return
    }

    const jobId = await DatabaseMethods.GetJobIdByName(jobName)
    if (!jobId) {
        message.channel.send("Invalid job. Please use `b!jobs` to see a list of avaliable jobs for your level.")
        return
    }

    await DatabaseMethods.GiveJob(author, jobId).then(() => {
        message.channel.send(`You have became a ${jobName}! Your income will be apart of your daily reward.`)
    })
}

const Resign = async (message: Message) => {
    const author = message.author
    const record = await DatabaseMethods.GetUserRecord(author)
    if (!record) {
        message.channel.send("You must have a BankingBot account initialised to use that command!")
        return
    }

    if (record.occupation === 0) {
        message.channel.send("You're already unemployed.")
        return
    }

    const jobName = await DatabaseMethods.GetJobNameById(record.occupation)

    await DatabaseMethods.ResignUser(author).then(() => {
        message.channel.send(`You've resigned from your position as a ${jobName}.`)
    })
}

const Cmd: Command = {
    Name: "jobs",
    Description: "Lists all avaliable jobs for the user's level.",
    Usage: "`b!jobs`",
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        let action = args[1]

        const record = await DatabaseMethods.GetUserRecord(author)
        if (!record) {
            message.channel.send("You must have a BankingBot account initialised before you can view the jobs. Use `b!account create`.")
            return
        }

        if (!action) {
            await DisplayJobsForLevel(message, record.level)
            return
        }

        action = action.toLowerCase()

        if (action == "get") {
            await GetJob(message, args)
            return
        }

        if (action == "resign") {
            await Resign(message)
            return
        }
    }
}

export default Cmd