import { Heist, HeistDifficulty } from "@prisma/client"
import * as DatabaseMethods from "../Database"

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