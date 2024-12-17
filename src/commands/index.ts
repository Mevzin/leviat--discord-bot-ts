import { APIInteractionGuildMember, Guild, GuildMember } from "discord.js";
import farmCommands from "./farm";
import moneyCommands from "./money";
import toolsCommands from "./tools";

export default function globalCommandsHandler(
    commandName: string,
    options: any,
    member: GuildMember | APIInteractionGuildMember | null,
    guild: Guild | null,
    interaction: any
) {
    if (commandName.includes("farm")) farmCommands(commandName, options, member, guild, interaction)
    if (commandName.includes("money")) moneyCommands(commandName, options, member, guild, interaction)
    if (commandName.includes("tools")) toolsCommands(commandName, options, member, guild, interaction)
}   