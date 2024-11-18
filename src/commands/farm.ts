import { APIInteractionGuildMember, CommandInteractionOptionResolver, EmbedBuilder, Guild, GuildMember, Interaction } from "discord.js";
import UserFarm from "../models/UserFarm";

async function updateUserFarm(userId: string, tintas: number, papeis: number) {
    const adjustedPaints = Math.max(0, tintas);
    const adjustedPapers = Math.max(0, papeis);

    const userFarm = await UserFarm.findOneAndUpdate(
        { userId },
        { $inc: { tintas: (adjustedPaints), papeis: (adjustedPapers) } },
        { new: true, upsert: true }
    );
    return userFarm;
}

async function removeUserFarm(userId: string, tintas: number, papeis: number) {
    const adjustedPaints = Math.max(0, tintas);
    const adjustedPapers = Math.max(0, papeis);

    const userFarm = await UserFarm.findOneAndUpdate(
        { userId },
        { $inc: { tintas: -(adjustedPaints), papeis: -(adjustedPapers) } },
        { new: true, upsert: true }
    );
    return userFarm;
}

export default async function farmCommands(
    commandName: string,
    options: CommandInteractionOptionResolver,
    member: GuildMember | APIInteractionGuildMember | null,
    guild: Guild | null,
    interaction: any
) {
    if (commandName.includes("add")) {
        const tintas = options.data.find((item: { name: string; }) => item.name === 'tintas')?.value;
        const papeis = options.data.find((item: { name: string; }) => item.name === 'papeis')?.value;
        const userId = interaction.user.id;

        try {
            const userFarm = await updateUserFarm(userId, tintas as number, papeis as number);
            const embedMessage = new EmbedBuilder()
                .setColor(0x008207)
                .setTitle('Farm adicionado com sucesso!')
                .addFields(
                    { name: 'Tintas', value: `${tintas}`, inline: true },
                    { name: 'Papel Moeda', value: `${papeis}`, inline: true },
                )
                .addFields(
                    { name: 'Total de tintas', value: `${userFarm?.tintas}`, inline: false },
                    { name: 'Total de Papel Moeda', value: `${userFarm?.papeis}`, inline: false },
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embedMessage] });
        } catch (error) {
            console.error('Erro ao atualizar farm:', error);
            await interaction.reply('Ocorreu um erro ao atualizar seus dados.');
        }
    }

    if (commandName.includes("rm")) {
        const tintas = options.data.find((item: { name: string; }) => item.name === 'tintas')?.value;
        const papeis = options.data.find((item: { name: string; }) => item.name === 'papeis')?.value;
        const userId = interaction.user.id;

        try {
            const userFarm = await removeUserFarm(userId, tintas as number, papeis as number);
            const embedMessage = new EmbedBuilder()
                .setColor(0xc40404)
                .setTitle('Farm removido com sucesso!')
                .addFields(
                    { name: 'Tintas', value: `${tintas}`, inline: true },
                    { name: 'Papel Moeda', value: `${papeis}`, inline: true },
                )
                .addFields(
                    { name: 'Total de tintas', value: `${userFarm?.tintas}`, inline: false },
                    { name: 'Total de Papel Moeda', value: `${userFarm?.papeis}`, inline: false },
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embedMessage] });
        } catch (error) {
            console.error('Erro ao atualizar farm:', error);
            await interaction.reply('Ocorreu um erro ao atualizar seus dados.');
        }
    }
}