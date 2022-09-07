import { Heist, HeistDifficulty } from "@prisma/client"
import * as DatabaseMethods from "../Database"
import { User } from "discord.js"
import GlobalHeistData from "../cache/GlobalHeistData"
import { reset } from "../cache/GlobalHeistData"

export async function UpdateHeists() {
    console.log("Updating heists...")

    const heists = await DatabaseMethods.HeistMethods.GetHeists()
    const updatedHeists = Array<Heist>()

    heists.forEach((heist) => {
        heist.avaliable = false
    })

    for (var i = 0; i < 3; i++) {
        const heist = heists[i]
        heist.avaliable = true
        updatedHeists.push(heist)
    }

    await DatabaseMethods.HeistMethods.UpdateHeists(updatedHeists).then(() => {
        console.log("Updated heists!")
    })

    const avaliableHeists = await DatabaseMethods.HeistMethods.GetAvaliableHeists()
    avaliableHeists.forEach((heist) => {
        GlobalHeistData.push({
            Heist: heist,
            Users: new Set<User>()
        })
    })

    return updatedHeists
}

export async function InitializeUpdate() {
    await UpdateHeists()
    setTimeout(InitializeUpdate, 21600000)
}

export function GetHeistMaxUsersByDifficulty(difficulty: HeistDifficulty) {
    let returnVal = 0

    switch (difficulty) {
        case HeistDifficulty.Cakewalk: returnVal = 20
        case HeistDifficulty.Easy: returnVal = 15
        case HeistDifficulty.Medium: returnVal = 12
        case HeistDifficulty.Hard: returnVal = 10
        case HeistDifficulty.Extreme: returnVal = 8
        case HeistDifficulty.Nightmare: returnVal = 6
    }

    return returnVal
}

export function GetHeistDurationByDifficulty(difficulty: HeistDifficulty) {
    let returnVal = 0

    switch (difficulty) {
        case HeistDifficulty.Cakewalk: returnVal = 1800000
        case HeistDifficulty.Easy: returnVal = 3600000
        case HeistDifficulty.Medium: returnVal = 7200000
        case HeistDifficulty.Hard: returnVal = 10800000
        case HeistDifficulty.Extreme: returnVal = 21600000
        case HeistDifficulty.Nightmare: returnVal = 32400000
    }

    return returnVal
}

export function UserInHeist(user: User) {
    return GlobalHeistData.filter((heist) => heist.Users.has(user)).length > 0
}

export function GetHeist(name: string) {
    const heist = GlobalHeistData.find((h) => h.Heist.name.toLowerCase() == name.toLowerCase())
    return heist
}

export async function JoinHeist(user: User, heistName: string) {
    const heist = GetHeist(heistName)
    if (!heist) return

    const record = await DatabaseMethods.UserMethods.GetUserRecord(user.id)
    if (!record) return
    if (record.level < heist.Heist.requiredLevel) return

    heist.Users.add(user)
}

export function LeaveHeist(user: User) {
    const heist = GetUserHeist(user)
    if (!heist) return

    const index = GlobalHeistData.indexOf(heist)
    GlobalHeistData.splice(index, 1)
}

export function GetUserHeist(user: User) {
    const heist = GlobalHeistData.find((h) => h.Users.has(user))
    return heist
}

export function ClearHeists() {
    reset()
}