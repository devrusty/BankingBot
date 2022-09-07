import { PrismaClient } from "@prisma/client"

const PClient: PrismaClient = new PrismaClient()

export async function GetJobs() {
    const jobs = await PClient.job.findMany()
    return jobs
}

export async function GetJobsForLevel(level: number) {
    const jobs = await GetJobs()
    return jobs.filter(job => {
        return job.requiredLevel <= level
    })
}

export async function GetJobById(id: number) {
    const jobs = await GetJobs()
    const job = jobs.find(job => job.id == id)
    return job
}

export async function GetJobByName(name: string) {
    name = name.toLowerCase()
    const jobs = await GetJobs()
    const job = jobs.find(job => job.name.toLowerCase() == name)

    return job
}

export async function GetJobIdByName(name: string) {
    const job = await GetJobByName(name)
    if (!job) return false
    return job.id
}

export async function GetJobNameById(id: number) {
    const job = await GetJobById(id)
    if (!job) return false
    return job.name
}