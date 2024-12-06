import { APIInteractionGuildMember, CommandInteractionOptionResolver, Guild, GuildMember } from "discord.js";


export default async function toolsCommands(
    commandName: string,
    options: CommandInteractionOptionResolver,
    member: GuildMember | APIInteractionGuildMember | null,
    guild: Guild | null,
    interaction: any
) {
    if (commandName.includes("_RemoveMember")) {

    }

}