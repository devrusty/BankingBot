import HorseColour from "./HorseColour"

class HorseRacingHorse {
    constructor(bet: number, colour: HorseColour) {
        this.bet = bet
        this.colour = colour
    }

    public bet: number
    public colour: HorseColour
}

export default HorseRacingHorse