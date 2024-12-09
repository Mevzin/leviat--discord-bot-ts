import { APIEmbedField, APIInteractionGuildMember, CommandInteractionOptionResolver, EmbedBuilder, Guild, GuildMember, Interaction, PermissionsBitField, UserFlagsBitField } from "discord.js";
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
    if (commandName.includes("add_")) {
        const tintas = options.data.find((item: { name: string; }) => item.name === 'tintas')?.value;
        const papeis = options.data.find((item: { name: string; }) => item.name === 'papeis')?.value;
        const userId = interaction.user.id;
        const userName = interaction.user;

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

    if (commandName.includes("rm_")) {
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
    if (commandName.includes("list_")) {
        try {
            const farms = await UserFarm.find();
            if (farms.length === 0) {
                await interaction.reply('Nenhum farm foi registrado ainda.');
                return;
            }

            function handleFarm(tintas: number, papeis: number) {
                if (tintas < 2000 && papeis < 4000) {
                    return "❌"
                } else {
                    return "✔"
                }
            }

            const farmList = farms.map((farm, index) => {
                return ({ name: ` Tintas: ${farm.tintas} | Papeis: ${farm.papeis}  `, value: `<@${farm.userId}> | ${handleFarm(farm.tintas, farm.papeis)}` })
            })

            const embedMessage = new EmbedBuilder()
                .setColor(0x2f302f)
                .setTitle('Farm dos membros!')
                .addFields(farmList)
                .addFields({ name: "Número de membros cadastrados: ", value: `${farms.length}` })
                .setTimestamp();
            await interaction.reply({ embeds: [embedMessage] });

        } catch (error) {
            console.error('Erro ao listar farms:', error);
            await interaction.reply('Ocorreu um erro ao listar os farms. Tente novamente mais tarde.');
        }
    }

    if (commandName.includes("reset")) {
        if (interaction.user.flags.UserFlagsBitField !== UserFlagsBitField.Flags.Staff) {
            await interaction.reply('Você não tem permissão para usar este comando.');
            return;
        }

        try {
            const result = await UserFarm.updateMany({}, { tintas: 0, papeis: 0 });

            await interaction.reply(
                `Os campos de tintas e papéis foram redefinidos para **${result.modifiedCount}** usuários.`
            );
        } catch (error) {
            console.error('Erro ao redefinir farms:', error);
            await interaction.reply('Ocorreu um erro ao redefinir os farms. Tente novamente mais tarde.');
        }
    }
}
