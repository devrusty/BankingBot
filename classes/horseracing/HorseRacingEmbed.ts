import { EmbedBuilder } from "discord.js";
import HorseRacingHorse from "./HorseRacingHorse";
import HorseColour from "./HorseColour";

const Flags = {
    Red: "",
    Blue: "",
    Orange: "",
    Yellow: "",
    Green: ""
}

class HorseRacingEmbed {
    constructor(color: string, maxTurns?: number) {
        this.Horses = new Array<HorseRacingHorse>()
        this.Turns = 0
        this.MaxTurns = maxTurns || 5

        /* Configuring embed */
        this.Embed.setTitle("Horse Racing")
        this.Embed.setColor("Red")

        this.Render()
    }

    private readonly Embed: EmbedBuilder = new EmbedBuilder();
    private Horses: HorseRacingHorse[];
    private Turns: number;
    private MaxTurns: number;

    public Render() {
        this.Horses.forEach((horse) => {
            const colour = String(horse.colour)
            //const flag = Flags[colour]
        })
    }
}

export default HorseRacingEmbed