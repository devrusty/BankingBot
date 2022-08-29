import HeistMeta from "../interfaces/HeistMeta";
import * as DatabaseMethods from "../Database"
import { User } from "discord.js";

let GlobalHeistData: Array<HeistMeta> = new Array<HeistMeta>()

async function Init() {
    const Heists = await DatabaseMethods.GetAvaliableHeists()
    GlobalHeistData = Heists.map((heist) => {
        return {
            Heist: heist,
            Users: new Array<User>()
        }
    })
}

Init()

export default GlobalHeistData