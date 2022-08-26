import { Heist } from "@prisma/client";
import { User } from "discord.js";

export default interface HeistMeta {
    Heist: Heist,
    Users: User[]
}