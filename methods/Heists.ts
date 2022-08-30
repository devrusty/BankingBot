import { Heist, HeistDifficulty } from "@prisma/client"
import * as DatabaseMethods from "../Database"
import { User } from "discord.js"
import GlobalHeistData from "../cache/GlobalHeistData"

export async function UpdateHeists() {
    console.log("Updating heists...")

    const heists = await DatabaseMethods.GetHeists()
    const updatedHeists = Array<Heist>()

    heists.forEach((heist) => {
        heist.avaliable = false
    })

    for (var i = 0; i < 3; i++) {
        const heist = heists[i]
        heist.avaliable = true
        updatedHeists.push(heist)
    }

    await DatabaseMethods.UpdateHeists(updatedHeists).then(() => {
        console.log("Updated heists!")
    })

    const avaliableHeists = await DatabaseMethods.GetAvaliableHeists()
    avaliableHeists.forEach((heist) => {
        GlobalHeistData.push({
            Heist: heist,
            Users: new Array<User>()
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
        case HeistDifficulty.Cakewalk: returnVal = 10
        case HeistDifficulty.Easy: returnVal = 8
        case HeistDifficulty.Medium: returnVal = 6
        case HeistDifficulty.Hard: returnVal = 5
        case HeistDifficulty.Extreme: returnVal = 4
        case HeistDifficulty.Nightmare: returnVal = 3
    }

    return returnVal
}

export function UserInHeist(user: User) {
    return GlobalHeistData.filter((heist) => heist.Users.includes(user)).length > 0
}

export function GetHeist(name: string) {
    const heist = GlobalHeistData.find((h) => h.Heist.name.toLowerCase() == name.toLowerCase())
    return heist
}

export function JoinHeist(user: User, heistName: string) {
    const heist = GetHeist(heistName)
    if (!heist) return

    heist.Users.push(user)
}