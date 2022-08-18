import * as DatabaseMethods from "../databaseMethods"
import { Item } from "@prisma/client"

export async function UpdateItemShop() {
    console.log("Updating item shop..")
    const itemShopItems = await DatabaseMethods.GetItems()
    itemShopItems.forEach(item => {
        return item.onSale = false
    })

    const items: Item[] = new Array<Item>()

    for (let i = 0; i < 9; i++) {
        const randomIndex = Math.floor(Math.random() * itemShopItems.length)
        const item = itemShopItems[randomIndex]

        if (!items.includes(item)) {
            item.onSale = true
            items.push(item)
        }
    }

    await DatabaseMethods.UpdateItemShop(items).then(() => {
        console.log("Updated item shop!")
    })
}