import { Job } from "@prisma/client";

export function GetJobIncome(job: Job) {
    return Math.floor(job.requiredLevel * 3000)
}