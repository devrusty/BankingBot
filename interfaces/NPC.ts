export enum Gender {
    Male,
    Female,
    NonBinary
}

export default interface NPC {
    name: string,
    description: string,
    gender?: Gender,
    age: number,
    level: number,
    antagonist: boolean,
    givesQuests: boolean,
    dialogue: string[]
}