import NPC, { Gender } from "../interfaces/NPC";

const List: NPC[] = [
    {
        name: "Rust",
        description: "Rust is a major charcter in the BankingBot storyline.",
        gender: Gender.NonBinary,
        age: 15,
        level: 50,
        antagonist: false,
        givesQuests: true
    },
    {
        name: "Joe",
        description: "Joe is the king of Joeland, a major location in BankingBot.",
        gender: Gender.Male,
        age: 25,
        level: 100,
        antagonist: true,
        givesQuests: false
    }
]

export default List