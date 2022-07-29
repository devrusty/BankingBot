import { prisma, PrismaClient } from "@prisma/client"
import { User } from "@prisma/client"
import { GuildMember } from "discord.js"

function CreatePrismaClient(): PrismaClient {
    return new PrismaClient()
}

export async function UserRecordExists(user: GuildMember): Promise<boolean> {
    const client: PrismaClient = CreatePrismaClient()
    const userResult = await client.user.count({
        where: {
            id: Number(user.id)
        }
    })

    await client.$disconnect()
    return userResult > 0
}

export async function CreateUserRecord(user: GuildMember): Promise<boolean> {
    const id: number = Number(user.id)
    const client: PrismaClient = CreatePrismaClient()

    const userExists: boolean = await UserRecordExists(user)
    if (userExists) return false

    await client.user.create({
        data: {
            id: id
        }
    }).catch(err => {
        console.trace(err)
    })

    await client.$disconnect()
    return true
}

export async function GetUserBalance(user: GuildMember) {
    const id: number = Number(user.id)
    const client: PrismaClient = CreatePrismaClient()

    const userExists: boolean = await UserRecordExists(user)
    if (!userExists) return 0

    const userRecord = await client.user.findFirst({
        where: {
            id: id
        }
    })
    await client.$disconnect()
    if (!userRecord) return 0

    return userRecord.coins
}
