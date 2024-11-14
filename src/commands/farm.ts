import { Client, GatewayIntentBits, CommandInteraction, EmbedBuilder, Options } from 'discord.js';
import UserFarm from '../models/UserFarm';

async function updateUserFarm(userId: string, tintas: number, papeis: number) {
    const tintasAjustadas = Math.max(0, tintas);
    const papeisAjustados = Math.max(0, papeis);

    const userFarm = await UserFarm.findOneAndUpdate(
        { userId },
        { $inc: { tintas: (tintasAjustadas), papeis: (papeisAjustados) } },
        { new: true, upsert: true }
    );
    return userFarm;
}

async function removeUserFarm(userId: string, tintas: number, papeis: number) {
    const tintasAjustadas = Math.max(0, tintas);
    const papeisAjustados = Math.max(0, papeis);

    const userFarm = await UserFarm.findOneAndUpdate(
        { userId },
        { $inc: { tintas: -(tintasAjustadas), papeis: -(papeisAjustados) } },
        { new: true, upsert: true }
    );
    return userFarm;
}
export default async function farmCommands(commandName: string, options: any, interaction: any) {

    if (commandName === 'add_farm') {
        const tintas = options.data.find((item: { name: string; }) => item.name === 'tinta')?.value;
        const papeis = options.data.find((item: { name: string; }) => item.name === 'papel')?.value;
        const userId = interaction.user.id;

        try {
            const userFarm = await updateUserFarm(userId, tintas as number, papeis as number);
            const embedMessage = new EmbedBuilder()
                .setColor(0x008207)
                .setTitle('Farm atualizado com sucesso')
                .setDescription('Foram adicionados as seguintes quantidades!')
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
    if (commandName === 'rm_farm') {
        const tintas = options.data.find((item: { name: string; }) => item.name === 'tinta')?.value;
        const papeis = options.data.find((item: { name: string; }) => item.name === 'papel')?.value;
        const userId = interaction.user.id;

        try {
            const userFarm = await removeUserFarm(userId, tintas as number, papeis as number);
            const embedMessage = new EmbedBuilder()
                .setColor(0x0099ff)
                .setTitle('Farm atualizado com sucesso')
                .setDescription('Foram removidos as seguintes quantidades!')
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