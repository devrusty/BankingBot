import { PrismaClient } from "@prisma/client"
import * as Prisma from "@prisma/client"
import { User } from "discord.js"

const PClient: PrismaClient = new PrismaClient()

export async function UserRecordExists(user: User): Promise<boolean> {
    const userResult = await PClient.user.count({
        where: {
            id: Number(user.id)
        }
    })

    return userResult > 0
}

export async function CreateUserRecord(user: User): Promise<boolean> {
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

export async function GetUserBalance(user: User) {
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

export async function RemoveFromBalance(user: User, amount: number) {
    const id: number = Number(user.id)
    const userExists: boolean = await UserRecordExists(user)
    if (!userExists) return false

    const userRecord = await PClient.user.findFirst({
        where: {
            id: id
        }
    })

    if (!userRecord) return console.log("User doesn't exist.")

    await PClient.user.update({
        where: {
            id: id
        },
        data: {
            coins: userRecord.coins - amount
        }
    })
}

export async function AddToBalance(user: User, amount: number) {
    const id: number = Number(user.id)
    const userExists: boolean = await UserRecordExists(user)
    if (!userExists) return false

    const userRecord = await PClient.user.findFirst({
        where: {
            id: id
        }
    })

    if (!userRecord) return console.log("User doesn't exist.")

    await PClient.user.update({
        where: {
            id: id
        },
        data: {
            coins: userRecord.coins + amount
        }
    })
}