import { PrismaClient } from "@prisma/client"
import * as UserMethods from "./Users"

const PClient: PrismaClient = new PrismaClient()

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

    const record = await UserMethods.GetUserRecord(id)
    if (!record) return false
    if (record.achievements.includes(achievementData.id)) return false

    record.achievements.push(achievementData.id)
    await UserMethods.SetUser(id, record)
}