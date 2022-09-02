import { Item, User, PrismaClient, Heist, ItemType } from "@prisma/client"
import Donation from "./interfaces/donation"
import { GetLevelMaxXP } from "./methods/Levels"

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

    await AwardAchievement(id, "Millionaire")
    console.log(`Awarded Millionaire achievement to ${id}.`)

    if (userRecord.cash < 1000000000) return
    if (userRecord.achievements.includes(4)) return

    await AwardAchievement(id, "Billionaire")
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

export async function GetItems() {
    return await PClient.item.findMany()
}

export async function GetOnsaleItems() {
    const items = await GetItems()
    const onsaleItems = items.filter(item => item.onSale)

    return onsaleItems
}

export async function GetItemById(id: number) {
    const items = await GetItems()
    return items.find((item) => item.id == id)
}

export async function GetUserInventory(id: string) {
    const record = await GetUserRecord(id)
    if (!record) return false

    const inventory = record.inventory
    const items = await Promise.all(inventory.map(async (id) => {
        const data = await GetItemById(id)
        return data
    }))

    return items
}

export async function PurchaseItem(id: string, item: string) {
    const userRecord = await GetUserRecord(id)
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

    await RemoveFromBalance(id, itemData.price)
}

export async function GetItemIdByName(name: string) {
    const items = await GetItems()
    const item = items.find((i) => {
        return i.name.toLowerCase() == name.toLowerCase()
    })

    return item?.id
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

export async function UserShopExists(id: string) {
    const userExists = await UserRecordExists(id)
    if (!userExists) return

    const userShop = await PClient.personalShop.count({
        where: {
            ownerId: id
        }
    })

    return userShop > 0
}

export async function CreateUserShop(id: string) {
    const userExists = await UserRecordExists(id)
    if (!userExists) return "User doesn't exist."

    const isPremium = await IsUserPremium(id)
    if (!isPremium) return "User is not premium."

    const userShopExists = await UserShopExists(id)
    if (userShopExists) return "User already has a shop."

    await PClient.personalShop.create({
        data: {
            ownerId: id
        }
    }).catch(e => {
        console.log(e)
    })
}

export async function GetUserShop(id: string) {
    const userShopExists = await UserShopExists(id)
    if (!userShopExists) return

    const shop = await PClient.personalShop.findFirst({
        where: {
            ownerId: id
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

export async function GiveJob(id: string, jobId: number) {
    const recordExists = await UserRecordExists(id)
    if (!recordExists) return false

    const record = await GetUserRecord(id)
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

export async function GetAchievements() {
    const achievements = await PClient.achievement.findMany()
    return achievements
}

export async function GetAchievementByName(name: string) {
    const achievements = await GetAchievements()
    const achievement = achievements.find((achievement) => achievement.name.toLowerCase() == name.toLowerCase())
    return achievement
}

export async function AwardAchievement(id: string, achievement: string) {
    const achievementData = await GetAchievementByName(achievement)
    if (!achievementData) return false

    const record = await GetUserRecord(id)
    if (!record) return false
    if (record.achievements.includes(achievementData.id)) return false

    record.achievements.push(achievementData.id)
    await SetUser(id, record)
}

export async function GetHeists() {
    const heists = await PClient.heist.findMany()
    return heists
}

export async function GetAvaliableHeists() {
    const heists = await GetHeists()
    const avaliableHeists = heists.filter((heist) => heist.avaliable)
    return avaliableHeists
}

export async function UpdateHeists(heists: Heist[]) {
    heists.forEach(async (heist: Heist) => {
        PClient.heist.update({
            where: {
                id: heist.id
            },
            data: heist
        })
    })
}

export async function GetHeistByName(name: string) {
    const heists = await GetHeists()
    const heist = heists.find((h) => h.name.toLowerCase() == name.toLowerCase())
    return heist
}

export async function GetHeistById(id: number) {
    const heists = await GetHeists()
    const heist = heists.find((h) => h.id == id)
    return heist
}

export async function SetMask(userId: string, itemId: number) {
    const user = await GetUserRecord(userId)
    if (!user) return

    const item = await GetItemById(itemId)
    if (!item) return
    if (!item.type.includes(ItemType.Mask)) return
    if (!user.inventory.includes(item.id)) return

    user.mask = item.id
    await SetUser(userId, user)
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