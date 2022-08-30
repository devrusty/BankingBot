import HeistMeta from "../interfaces/HeistMeta";

let GlobalHeistData: Array<HeistMeta> = new Array<HeistMeta>()

export function reset() {
    GlobalHeistData = new Array<HeistMeta>()
}

export default GlobalHeistData