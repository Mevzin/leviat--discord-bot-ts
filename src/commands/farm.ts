import { APIEmbedField, APIInteractionGuildMember, AttachmentBuilder, CommandInteractionOptionResolver, EmbedBuilder, Guild, GuildMember, Interaction, PermissionsBitField, UserFlagsBitField } from "discord.js";
import UserFarm from "../models/UserFarm";
import { unlinkSync, writeFileSync } from "fs";

async function updateUserFarm(userId: string, recibos: number) {
    const adjustedNotes = Math.max(0, recibos);

    const userFarm = await UserFarm.findOneAndUpdate(
        { userId },
        { $inc: { recibos: (adjustedNotes) } },
        { new: true, upsert: true }
    );
    return userFarm;
}

async function removeUserFarm(userId: string, recibos: number) {
    const adjustedNotes = Math.max(0, recibos);

    const userFarm = await UserFarm.findOneAndUpdate(
        { userId },
        { $inc: { recibos: -(adjustedNotes) } },
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
        const recibos = options.data.find((item: { name: string; }) => item.name === 'recibos')?.value;
        const userId = interaction.user.id;
        const userName = interaction.user;

        try {
            const userFarm = await updateUserFarm(userId, recibos as number);
            const embedMessage = new EmbedBuilder()
                .setColor(0x008207)
                .setTitle('Farm adicionado com sucesso!')
                .addFields(
                    { name: 'Recibos', value: `${recibos}`, inline: true },
                )
                .addFields(
                    { name: 'Total de recibos', value: `${userFarm?.recibos}`, inline: false },
                )
                .setTimestamp();
            await interaction.reply({ embeds: [embedMessage] });
        } catch (error) {
            console.error('Erro ao atualizar farm:', error);
            await interaction.reply('Ocorreu um erro ao atualizar seus dados.');
        }
    }

    if (commandName.includes("rm_")) {
        const recibos = options.data.find((item: { name: string; }) => item.name === 'recibos')?.value;
        const userId = interaction.user.id;

        try {
            const userFarm = await removeUserFarm(userId, recibos as number);
            const embedMessage = new EmbedBuilder()
                .setColor(0xc40404)
                .setTitle('Farm removido com sucesso!')
                .addFields(
                    { name: 'Recibos', value: `${recibos}`, inline: true },
                )
                .addFields(
                    { name: 'Total de recibos', value: `${userFarm?.recibos}`, inline: false },
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
            const users = await UserFarm.find();
            if (users.length === 0) {
                await interaction.reply('Nenhum farm foi registrado ainda.');
                return;
            }

            function handleFarm(recibos: number) {
                if (recibos < 4000) {
                    return "❌"
                } else {
                    return "✔"
                }
            }

            let fileContent = 'Lista de Farms\n\n';
            users.forEach((user) => {
                fileContent += `Usuário: <@${user.userId}> | ${handleFarm(user.recibos)} ┐\n`;
                fileContent += `│  - Recibos: ${user.recibos}              │\n`;
                fileContent += `└───────────────────────────────────┘ \n\n`;
            });

            const filePath = './farms.txt';
            writeFileSync(filePath, fileContent);

            const attachment = new AttachmentBuilder(filePath, { name: 'farms.txt' });

            await interaction.reply({
                content: 'Aqui está o arquivo com os farms exportados:',
                files: [attachment],
            });

            unlinkSync(filePath);
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
