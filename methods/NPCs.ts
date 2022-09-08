import NPCList from "../cache/NPCList"

export function GetNPCDialogue() {
    const index = Math.floor(Math.random() * NPCList.length)
    const npc = NPCList[index]

    const dialogueIndex = Math.floor(Math.random() * npc.dialogue.length)
    const dialogue = npc.dialogue[dialogueIndex]

    return {
        npc: npc,
        dialogue: dialogue
    }
}