import { APIInteractionGuildMember, CommandInteractionOptionResolver, Guild, GuildMember } from "discord.js";
import UserFarm from "../models/UserFarm";
import UserDirtyMoney from "../models/UserDirtyMoney";


export default async function toolsCommands(
    commandName: string,
    options: CommandInteractionOptionResolver,
    member: GuildMember | APIInteractionGuildMember | null,
    guild: Guild | null,
    interaction: any
) {
    if (commandName.includes("_remove_member")) {
        const user = interaction.options.getUser('user');
        console.log(user);


        if (!user) {
            await interaction.reply('Usuário inválido ou não encontrado.');
            return;
        }

        try {
            // Tenta remover o usuário do banco de dados
            const result = await UserDirtyMoney.deleteOne({ userId: user.id });

            if (result.deletedCount === 0) {
                await interaction.reply(`O usuário <@${user.id}> não foi encontrado nas listas.`);
            } else {
                await interaction.reply(`O usuário <@${user.id}> foi removido das listas com sucesso.`);
            }
        } catch (error) {
            console.error('Erro ao remover usuário:', error);
            await interaction.reply('Ocorreu um erro ao tentar remover o usuário. Tente novamente mais tarde.');
        }
    }

}