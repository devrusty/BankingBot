import { PrismaClient, Heist } from "@prisma/client"

const PClient: PrismaClient = new PrismaClient()

export async function GetHeists() {
    const heists = await PClient.heist.findMany()
    return heists
}

export async function GetAvaliableHeists() {
    const heists = await GetHeists()
    const avaliableHeists = heists.filter((heist) => heist.avaliable)
    return avaliableHeists
}

export async function UpdateHeists(heists: Heist[]) {
    heists.forEach(async (heist: Heist) => {
        PClient.heist.update({
            where: {
                id: heist.id
            },
            data: heist
        })
    })
}

export async function GetHeistByName(name: string) {
    const heists = await GetHeists()
    const heist = heists.find((h) => h.name.toLowerCase() == name.toLowerCase())
    return heist
}

export async function GetHeistById(id: number) {
    const heists = await GetHeists()
    const heist = heists.find((h) => h.id == id)
    return heist
}