import { PrismaClient } from "@prisma/client"
import * as UserMethods from "./Users"

const PClient: PrismaClient = new PrismaClient()

export async function GetQuests() {
    const quests = await PClient.quest.findMany()
    return quests
}

export async function GetQuestById(id: number) {
    const quests = await GetQuests()
    const quest = quests.find((q) => q.id == id)
    return quest
}

export async function HasQuest(userId: string, questId: number) {
    const record = await UserMethods.GetUserRecord(userId)
    const questData = await GetQuestById(questId)

    if (!record) return false
    if (!questData) return false

    return record.quests.includes(questId) || record.awaitingQuests.includes(questId) || record.completedQuests.includes(questId)
}

export async function GiveQuest(userId: string, questId: number) {
    const record = await UserMethods.GetUserRecord(userId)
    const questData = await GetQuestById(questId)

    if (!record) return
    if (!questData) return

    const hasQuest = await HasQuest(userId, questId)
    if (hasQuest) return

    record.quests.push(questId)
    await UserMethods.SetUser(userId, record)
}

export async function RemoveAwaitingQuest(userId: string, questId: number) {
    const record = await UserMethods.GetUserRecord(userId)
    const questData = await GetQuestById(questId)

    if (!record) return
    if (!questData) return

    const quests = record.awaitingQuests
    const quest = quests.find((q) => q == questId)
    if (!quest) return

    const index = quests.indexOf(quest)
    quests.splice(index, 1)

    await UserMethods.SetUser(userId, record)
}