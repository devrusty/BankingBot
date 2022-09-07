import { PrismaClient, User, ItemType } from "@prisma/client"
import { GetLevelMaxXP } from "../Levels"
import * as AchievementMethods from "./Achievements"
import * as JobMethods from "./Jobs"
import * as ItemMethods from "./Items"
import Donation from "../../interfaces/donation"

const PClient: PrismaClient = new PrismaClient()

export async function GetUserRecord(id: string) {
    const userResult = await PClient.user.findFirst({
        where: {
            id: id
        }
    })

    if (!userResult) return undefined
    return userResult
}

export async function UserRecordExists(id: string) {
    const userResult = await PClient.user.count({
        where: {
            id: id
        }
    })

    return userResult > 0
}

export async function CreateUserRecord(id: string) {
    const record = await GetUserRecord(id)
    if (record) return false

    await PClient.user.create({
        data: {
            id: id
        }
    }).catch(err => {
        console.trace(err)
    })

    return true
}

export async function DeleteUserRecord(id: string) {
    const userExists = await UserRecordExists(id)
    if (!userExists) return false

    await PClient.user.delete({
        where: {
            id: id
        }
    })

    return true
}

export async function GetUserBalance(id: string) {
    const userExists: boolean = await UserRecordExists(id)
    if (!userExists) return 0

    const userRecord = await GetUserRecord(id)
    if (!userRecord) return 0

    return userRecord.cash
}

export async function IsUserPremium(id: string) {
    const userRecord = await GetUserRecord(id)
    if (!userRecord) return "User doesn't exist."
    return userRecord.premium
}

export async function RemoveFromBalance(id: string, amount: number) {
    const userExists: boolean = await UserRecordExists(id)
    if (!userExists) return false

    const userRecord = await GetUserRecord(id)

    if (!userRecord) return console.log("User doesn't exist.")
    if (!amount) return console.log("Invalid amount.")

    await PClient.user.update({
        where: {
            id: id
        },
        data: {
            cash: Math.floor(userRecord.cash - amount)
        }
    })
}

export async function AddToBalance(id: string, amount: number) {
    const userRecord = await GetUserRecord(id)
    if (!userRecord) return console.log("User doesn't exist.")

    const cash = Math.floor(userRecord.cash + amount)
    if (cash == NaN) return

    await PClient.user.update({
        where: {
            id: id
        },
        data: {
            cash: cash
        }
    })

    if (userRecord.cash < 1000000) return
    if (userRecord.achievements.includes(1)) return

    await AchievementMethods.AwardAchievement(id, "Millionaire")
    console.log(`Awarded Millionaire achievement to ${id}.`)

    if (userRecord.cash < 1000000000) return
    if (userRecord.achievements.includes(4)) return

    await AchievementMethods.AwardAchievement(id, "Billionaire")
    console.log(`Awarded Billionaire achievement to ${id}.`)
}

export async function SetUserLevel(id: string, level: number) {
    const recordExists = await UserRecordExists(id)
    if (!recordExists) return "User doesn't exist."

    const userRecord = await GetUserRecord(id)
    if (!userRecord) return "User doesn't exist."

    await PClient.user.update({
        where: {
            id: id
        },
        data: {
            xp: 0,
            level: level
        }
    })
}

export async function SetUser(id: string, data: User) {
    await PClient.user.update({
        where: {
            id: id
        },
        data: data
    }).then(() => {
        return true
    }).catch(() => {
        return false
    })
}

export async function GiveXP(id: string, xp: number) {
    const recordExists = await UserRecordExists(id)
    if (!recordExists) return "User doesn't exist."

    const userRecord = await GetUserRecord(id)
    if (!userRecord) return "User doesn't exist."

    userRecord.xp += xp

    const maxXp = GetLevelMaxXP(userRecord.level)

    if (userRecord.xp >= maxXp) {
        const remainingXp = userRecord.xp - maxXp

        userRecord.level += 1
        await SetUserLevel(id, userRecord.level)
        await GiveXP(id, remainingXp)
        return
    }

    await PClient.user.update({
        where: {
            id: id
        },
        data: {
            xp: userRecord.xp
        }
    })
}

export async function ResignUser(id: string) {
    const recordExists = await UserRecordExists(id)
    if (!recordExists) return false

    const record = await GetUserRecord(id)
    if (!record) return false

    record.occupation = 0

    await PClient.user.update({
        where: {
            id: id
        },
        data: record
    })
    return true
}

export async function BanUser(id: string) {
    const record = await GetUserRecord(id)
    if (!record) return false
    if (record.banned) return false

    record.banned = true

    await PClient.user.update({
        where: {
            id: id
        },
        data: record
    })

    return true
}

export async function PardonUser(id: string) {
    const record = await GetUserRecord(id)
    if (!record) return false
    if (!record.banned) return false

    record.banned = false

    await PClient.user.update({
        where: {
            id: id
        },
        data: record
    })

    return true
}

export async function GivePremium(id: string) {
    const record = await GetUserRecord(id)
    if (!record) return false
    if (record.premium) return false

    record.premium = true

    await PClient.user.update({
        where: {
            id: id
        },
        data: record
    })

    return true
}

export async function GetUsers() {
    const users = await PClient.user.findMany()
    return users
}

export async function GiveJob(id: string, jobId: number) {
    const recordExists = await UserRecordExists(id)
    if (!recordExists) return false

    const record = await GetUserRecord(id)
    if (!record) return false

    const job = await JobMethods.GetJobById(jobId)
    if (!job) return false

    record.occupation = job.id

    await PClient.user.update({
        where: {
            id: record.id
        },
        data: record
    })

    return true
}

export async function SetMask(userId: string, itemId: number) {
    const user = await GetUserRecord(userId)
    if (!user) return

    const item = await ItemMethods.GetItemById(itemId)
    if (!item) return
    if (!item.type.includes(ItemType.Mask)) return
    if (!user.inventory.includes(item.id)) return

    user.mask = item.id
    await SetUser(userId, user)
}

export async function GetUserInventory(id: string) {
    const record = await GetUserRecord(id)
    if (!record) return false

    const inventory = record.inventory
    const items = await Promise.all(inventory.map(async (id) => {
        const data = await ItemMethods.GetItemById(id)
        return data
    }))

    return items
}

export async function GetUserCashLeaderboard() {
    const aggregations = await PClient.user.findMany({
        take: 10,
        orderBy: {
            cash: "desc"
        }
    })

    return aggregations
}

export async function CreateDonationRecord(data: Donation) {
    await PClient.donation.create({
        data: {
            donator: data.donator,
            reciever: data.reciever,
            amount: data.amount
        }
    })
}