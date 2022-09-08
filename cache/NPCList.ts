import NPC, { Gender } from "../interfaces/NPC";

const List: NPC[] = [
    {
        name: "Rust",
        description: "Rust is a major charcter in the BankingBot storyline.",
        gender: Gender.NonBinary,
        age: 15,
        level: 1,
        antagonist: false,
        givesQuests: true,
        dialogue: [
            "Hello my name is Rust! It is nice to see you wanderer."
        ]
    },
    {
        name: "Joe",
        description: "Joe is the king of Joeland, a major location in BankingBot.",
        gender: Gender.Male,
        age: 25,
        level: 5,
        antagonist: true,
        givesQuests: false,
        dialogue: [
            "Hey, I am the king of Joeland. Why don't you stop by Joeland sometime?"
        ]
    }
]

export default List