import { Item, PrismaClient } from "@prisma/client"
import { User } from "discord.js"
import Donation from "./interfaces/donation"
import { GetLevelMaxXP } from "./methods/Levels"

const PClient: PrismaClient = new PrismaClient()

export async function GetUserRecord(user: User) {
    const id = user.id
    const userResult = await PClient.user.findFirst({
        where: {
            id: id
        }
    })

    if (!userResult) return undefined
    return userResult
}

export async function UserRecordExists(user: User): Promise<boolean> {
    const userResult = await PClient.user.count({
        where: {
            id: user.id
        }
    })

    return userResult > 0
}

export async function CreateUserRecord(user: User): Promise<boolean> {
    const id = user.id
    if (!await GetUserRecord(user)) return false

    await PClient.user.create({
        data: {
            id: id
        }
    }).catch(err => {
        console.trace(err)
    })

    return true
}

export async function DeleteUserRecord(user: User) {
    const id = user.id
    const userExists = await UserRecordExists(user)
    if (!userExists) return false

    await PClient.user.delete({
        where: {
            id: id
        }
    })

    return true
}

export async function GetUserBalance(user: User) {
    const userExists: boolean = await UserRecordExists(user)
    if (!userExists) return 0

    const userRecord = await GetUserRecord(user)
    if (!userRecord) return 0

    return userRecord.cash
}

export async function IsUserPremium(user: User) {
    const userRecord = await GetUserRecord(user)
    if (!userRecord) return "User doesn't exist."
    return userRecord.premium
}

export async function RemoveFromBalance(user: User, amount: number) {
    const id = user.id
    const userExists: boolean = await UserRecordExists(user)
    if (!userExists) return false

    const userRecord = await GetUserRecord(user)

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

export async function AddToBalance(user: User, amount: number) {
    const id = user.id
    const userExists: boolean = await UserRecordExists(user)
    if (!userExists) return false

    const userRecord = await GetUserRecord(user)

    if (!userRecord) return console.log("User doesn't exist.")

    await PClient.user.update({
        where: {
            id: id
        },
        data: {
            cash: Math.floor(userRecord.cash + amount)
        }
    })
}

export async function SetUserLevel(user: User, level: number) {
    const recordExists = await UserRecordExists(user)
    if (!recordExists) return "User doesn't exist."

    const userRecord = await GetUserRecord(user)
    if (!userRecord) return "User doesn't exist."

    await PClient.user.update({
        where: {
            id: user.id
        },
        data: {
            xp: 0,
            level: level
        }
    })
}

export async function GiveXP(user: User, xp: number) {
    const recordExists = await UserRecordExists(user)
    if (!recordExists) return "User doesn't exist."

    const userRecord = await GetUserRecord(user)
    if (!userRecord) return "User doesn't exist."

    userRecord.xp += xp

    const maxXp = GetLevelMaxXP(userRecord.level)

    if (userRecord.xp >= maxXp) {
        userRecord.level += 1
        await SetUserLevel(user, userRecord.level)
        return
    }

    await PClient.user.update({
        where: {
            id: user.id
        },
        data: {
            xp: userRecord.xp
        }
    })
}

export async function GetItems() {
    return await PClient.item.findMany()
}

export async function GetOnsaleItems() {
    const items = await GetItems()
    const onsaleItems = items.filter(item => item.onSale)

    return onsaleItems
}

export async function PurchaseItem(user: User, item: string) {
    const recordExists = await UserRecordExists(user)
    if (!recordExists) return "User doesn't exist!"

    const userRecord = await GetUserRecord(user)
    if (!userRecord) return "User doesn't exist!"

    const items = await GetItems()
    const itemData = items.find(i => {
        return i.name.toLowerCase() == item.toLowerCase()
    })

    if (!itemData) return "Invalid item"
    if (!itemData.onSale) return "That item is currently off sale. Use `b!shop` to see the current item shop."
    if (itemData.price > userRecord.cash) return "User cannot afford that item!"

    userRecord.inventory.push(itemData.id)

    await PClient.user.update({
        where: {
            id: userRecord.id
        },
        data: {
            inventory: userRecord.inventory
        }
    }).catch(err => {
        console.trace(err)
        return err
    })

    await RemoveFromBalance(user, itemData.price)
}

export async function UpdateItemShop(data: Item[]) {
    data.forEach(async (item: Item) => {
        await PClient.item.update({
            where: {
                id: item.id
            },
            data: item
        })
    })
}

export async function UserShopExists(user: User) {
    const userExists = await UserRecordExists(user)
    if (!userExists) return

    const userShop = await PClient.personalShop.count({
        where: {
            ownerId: user.id
        }
    })

    return userShop > 0
}

export async function CreateUserShop(user: User) {
    const id = user.id
    const userExists = await UserRecordExists(user)
    if (!userExists) return "User doesn't exist."

    const isPremium = await IsUserPremium(user)
    if (!isPremium) return "User is not premium."

    const userShopExists = await UserShopExists(user)
    if (userShopExists) return "User already has a shop."

    await PClient.personalShop.create({
        data: {
            ownerId: id
        }
    }).catch(e => {
        console.log(e)
    })
}

export async function GetUserShop(user: User) {
    const userShopExists = await UserShopExists(user)
    if (!userShopExists) return

    const shop = await PClient.personalShop.findFirst({
        where: {
            ownerId: user.id
        }
    })

    return shop
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

export async function GiveJob(user: User, jobId: number) {
    const recordExists = await UserRecordExists(user)
    if (!recordExists) return false

    const record = await GetUserRecord(user)
    if (!record) return false

    const job = await GetJobById(jobId)
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

export async function ResignUser(user: User) {
    const recordExists = await UserRecordExists(user)
    if (!recordExists) return false

    const record = await GetUserRecord(user)
    if (!record) return false

    record.occupation = 0

    await PClient.user.update({
        where: {
            id: user.id
        },
        data: record
    })
    return true
}