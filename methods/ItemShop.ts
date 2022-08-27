import * as DatabaseMethods from "../Database"

export async function UpdateItemShop() {
    console.log("Updating item shop..")
    const itemShopItems = await DatabaseMethods.GetItems()

    itemShopItems.forEach(item => {
        if (!item.alwaysOnSale) return item.onSale = false
    })

    for (let i = 0; i < itemShopItems.length; i++) {
        const randomIndex = Math.floor(Math.random() * itemShopItems.length)
        const item = itemShopItems[randomIndex]
        item.onSale = true
    }

    await DatabaseMethods.UpdateItemShop(itemShopItems).then(() => {
        console.log("Updated item shop!")
    })
}