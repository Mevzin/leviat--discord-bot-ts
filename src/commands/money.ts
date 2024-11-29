import { APIInteractionGuildMember, CommandInteractionOptionResolver, EmbedBuilder, Guild, GuildMember } from "discord.js";
import UserDirtyMoney from "../models/UserDirtyMoney";

async function updateDirtyMoney(userId: string, amount: number) {
    const amountToUpdate = Math.max(0, amount);

    const amountFarm = await UserDirtyMoney.findOneAndUpdate({ userId }, { $inc: { amount: (amountToUpdate) } }, { new: true, upsert: true })
    return amountFarm;
}

async function removeDirtyMoney(userId: string, amount: number) {
    const amountToUpdate = Math.max(0, amount);

    const amountFarm = await UserDirtyMoney.findOneAndUpdate(
        { userId },
        { $inc: { amount: -(amountToUpdate) } },
        { new: true, upsert: true })
    return amountFarm;
}
export default async function moneyCommands(
    commandName: string,
    options: CommandInteractionOptionResolver,
    member: GuildMember | APIInteractionGuildMember | null,
    guild: Guild | null,
    interaction: any
) {
    if (commandName.includes("add_")) {
        const quantidade = options.data.find((item: { name: string; }) => item.name === 'quantidade')?.value;
        const userId = interaction.user.id;
        try {
            const userMoney = await updateDirtyMoney(userId, quantidade as number);
            const embedMessage = new EmbedBuilder()
                .setColor(0x008207)
                .setTitle('Dinheiro adicionado com sucesso!')
                .setDescription('Foi adicionado o seguinte montante de dinheiro sujo!')
                .addFields(
                    { name: 'Dinheiro sujo', value: `${quantidade}`, inline: false },
                    { name: 'Dinheiro sujo total:', value: `${userMoney.amount}`, inline: false },
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embedMessage] });
        } catch (error) {
            console.error('Erro ao atualizar farm:', error);
            await interaction.reply('Ocorreu um erro ao atualizar seus dados.');
        }
    }

    if (commandName.includes("rm_")) {
        const quantidade = options.data.find((item: { name: string; }) => item.name === 'quantidade')?.value;
        const userId = interaction.user.id;
        try {
            const userMoney = await removeDirtyMoney(userId, quantidade as number);
            const embedMessage = new EmbedBuilder()
                .setColor(0xc40404)
                .setTitle('Dinheiro removido com sucesso!')
                .setDescription('Foi adicionado o seguinte montante de dinheiro sujo!')
                .addFields(
                    { name: 'Dinheiro sujo', value: `${quantidade}`, inline: false },
                    { name: 'Dinheiro sujo total:', value: `${userMoney.amount}`, inline: false },
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embedMessage] });
        } catch (error) {

            console.error('Erro ao atualizar farm:', error);
            await interaction.reply('Ocorreu um erro ao atualizar seus dados.');
        }
    }

    if (commandName.includes("list_")) {
        try {
            const farms = await UserDirtyMoney.find();
            if (farms.length === 0) {
                await interaction.reply('Nenhum farm foi registrado ainda.');
                return;
            }

            const farmList = farms.map((farm, index) => {
                return ({ name: ` `, value: `<@${farm.userId}> | Saldo: ${farm.amount}` })
            })

            const embedMessage = new EmbedBuilder()
                .setColor(0x0482bd)
                .setTitle('Lista de membros e seus saldos!')
                .addFields(farmList)
                .addFields({ name: "Contagem de membros cadastrados:", value: `${farms.length}` })
                .setTimestamp();
            await interaction.reply({ embeds: [embedMessage] });
        } catch (error) {
            console.error('Erro ao listar os saldos:', error);
            await interaction.reply('Ocorreu um erro ao listar os saldos. Tente novamente mais tarde.');
        }
    }
}