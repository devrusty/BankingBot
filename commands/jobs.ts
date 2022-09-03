import Command from "../interfaces/commandInterface";
import { Client, Message, EmbedBuilder } from "discord.js";
import * as DatabaseMethods from "../Database"
import FormatMoney from "../methods/FormatMoney";
import Config from "../config"
import * as JobMethods from "../methods/Jobs"

const RecentlyWorked = new Set()
const cooldown = 1800000

const DisplayJobsForLevel = async (message: Message, level: number) => {
    const jobs = await DatabaseMethods.GetJobsForLevel(level)
    const jobsEmbed = new EmbedBuilder()
    jobsEmbed.setDescription(`Use \`${Config.prefix}jobs get <jobName>\` to get a job.`)
    jobsEmbed.setTitle("Jobs")
    jobsEmbed.setColor("Red")

    let fields = new Array()

    for (var i = 0; i < 9; i++) {
        const index = Math.floor(Math.random() * jobs.length)
        const job = jobs[index]

        fields.push({
            name: job.name,
            value: `Income: $${FormatMoney(job.income)}\nLevel: ${job.requiredLevel}`,
            inline: true
        })
    }

    //if (fields.length > 25) fields.length = 25
    jobsEmbed.addFields(fields)
    jobsEmbed.setFooter({
        text: `Want to see more jobs? Run ${Config.prefix}jobs again.`
    })

    message.channel.send({
        embeds: [jobsEmbed]
    })
}

const GetJob = async (message: Message, args: string[]) => {
    const author = message.author
    const record = await DatabaseMethods.GetUserRecord(author.id)

    if (!record) {
        message.channel.send(`You do not have a BankingBot account initialised! Use \`${Config.prefix}account create\` to create one.`)
        return
    }

    const currentOccupation = await DatabaseMethods.GetJobById(record.occupation)
    if (currentOccupation) {
        message.channel.send(`You currently have a job! Please use \`${Config.prefix}jobs resign\` to quit your job before changing it.`)
        return
    }

    const jobName = args.slice(2).join(" ")
    if (!jobName) {
        message.channel.send("Please specify a job.")
        return
    }

    const jobs = await DatabaseMethods.GetJobs()
    const job = jobs.find(job => job.name.toLowerCase() == jobName.toLowerCase())
    if (!job) {
        message.channel.send(`Invalid job. Please use \`${Config.prefix}jobs\` to see a list of avaliable jobs for your level.`)
        return
    }

    if (job.requiredLevel > record.level) {
        message.channel.send(`${job.name} requires level ${job.requiredLevel}.`)
        return
    }

    const jobId = await DatabaseMethods.GetJobIdByName(jobName)
    if (!jobId) {
        message.channel.send(`Invalid job. Please use \`${Config.prefix}jobs\` to see a list of avaliable jobs for your level.`)
        return
    }

    await DatabaseMethods.GiveJob(author.id, jobId).then(() => {
        message.channel.send(`You have became a ${job.name}! Your income will be apart of your daily reward. You can also use \`${Config.prefix}jobs work\` every 30 minutes.`)
    })
}

const Resign = async (message: Message) => {
    const author = message.author
    const record = await DatabaseMethods.GetUserRecord(author.id)
    if (!record) {
        message.channel.send("You must have a BankingBot account initialised to use that command!")
        return
    }

    if (record.occupation === 0) {
        message.channel.send("You're already unemployed.")
        return
    }

    const jobName = await DatabaseMethods.GetJobNameById(record.occupation)

    await DatabaseMethods.ResignUser(author.id).then(() => {
        message.channel.send(`You've resigned from your position as a ${jobName}.`)
    })
}

const Work = async (message: Message) => {
    const author = message.author
    const record = await DatabaseMethods.GetUserRecord(author.id)
    if (!record) {
        message.channel.send(`You must have a BankingBot account initialised to use that command! \`${Config.prefix}account create\``)
        return
    }
    if (record.occupation == 0) {
        message.channel.send(`You must have a job to work. Use \`${Config.prefix}jobs\` to see a list of jobs that you can get.`)
        return
    }

    const jobName = await DatabaseMethods.GetJobNameById(record.occupation)
    if (!jobName) {
        message.channel.send("Invalid job.")
        return
    }

    const job = await DatabaseMethods.GetJobByName(jobName)
    if (!job) {
        message.channel.send("Invalid job.")
        return
    }

    if (RecentlyWorked.has(author.id)) {
        message.channel.send(`Please wait 30 minutes before working again.`)
        return
    }

    const income = JobMethods.GetJobIncome(job)
    const xp = Math.floor(income / 300)

    await DatabaseMethods.GiveXP(author.id, xp).catch((err) => {
        console.log(`There was an issue whilst giving XP to ${author.tag}!`)
        console.log(err)

        message.channel.send("There was an error whilst giving XP. This issue has been logged.")
    })
    await DatabaseMethods.AddToBalance(author.id, income).then(() => {
        message.channel.send(`You made $${FormatMoney(income)} and ${xp} XP from working as a ${job.name}.`)
        RecentlyWorked.add(author.id)
    }).catch((err) => {
        console.log(err)
        message.channel.send(`An error occurred. Please report it `)
    })

    setTimeout(() => {
        RecentlyWorked.delete(author.id)
    }, cooldown)
}

const Cmd: Command = {
    Name: "jobs",
    Description: "Lists all avaliable jobs for the user's level.",
    Usage: `\`${Config.prefix}jobs\``,
    Listed: true,
    Invoke: async (client: Client, message: Message, args: string[]) => {
        const author = message.author
        let action = args[1]

        const record = await DatabaseMethods.GetUserRecord(author.id)
        if (!record) {
            message.channel.send(`You must have a BankingBot account initialised before you can view the jobs. Use \`${Config.prefix}account create\`.`)
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

        if (action == "work") {
            await Work(message)
            return
        }
    }
}

export default Cmd