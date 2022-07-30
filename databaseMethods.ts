import { prisma, PrismaClient } from "@prisma/client"
import { User } from "@prisma/client"
import { GuildMember } from "discord.js"

const PClient: PrismaClient = new PrismaClient()

export async function UserRecordExists(user: GuildMember): Promise<boolean> {
    const userResult = await PClient.user.count({
        where: {
            id: Number(user.id)
        }
    })

    return userResult > 0
}

export async function CreateUserRecord(user: GuildMember): Promise<boolean> {
    const id: number = Number(user.id)

    const userExists: boolean = await UserRecordExists(user)
    if (userExists) return false

    await PClient.user.create({
        data: {
            id: id
        }
    }).catch(err => {
        console.trace(err)
    })

    return true
}

export async function GetUserBalance(user: GuildMember) {
    const id: number = Number(user.id)

    const userExists: boolean = await UserRecordExists(user)
    if (!userExists) return 0

    const userRecord = await PClient.user.findFirst({
        where: {
            id: id
        }
    })
    if (!userRecord) return 0

    return userRecord.coins
}
