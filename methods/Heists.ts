import { Heist } from "@prisma/client"
import * as DatabaseMethods from "../databaseMethods"
import HeistMeta from "../interfaces/HeistMeta"

export async function UpdateHeists() {
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

    return updatedHeists
}