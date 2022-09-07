import { PrismaClient, Item } from "@prisma/client"
import * as UserMethods from "./Users"

const PClient: PrismaClient = new PrismaClient()

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

export async function PurchaseItem(id: string, item: string) {
    const userRecord = await UserMethods.GetUserRecord(id)
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

    await UserMethods.RemoveFromBalance(id, itemData.price)
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