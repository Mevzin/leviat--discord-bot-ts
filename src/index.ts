import 'dotenv/config'
import { Client, GatewayIntentBits, EmbedBuilder, TextChannel, GuildMemberRoleManager } from 'discord.js';
import mongoose from 'mongoose';
import UserFarm from './models/UserFarm';
import { configDotenv } from 'dotenv';
import UserDirtyMoney from './models/UserDirtyMoney';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const CHANNEL_LOG_ID = process.env.ID_CHANNEL_LOG;
const ROLE_ID_ADD = process.env.ROLE_ID_ADD;
const ROLE_ID_REMOVE = process.env.ROLE_ID_REMOVE;

mongoose.connect(MONGO_URI as string)
    .then(() => console.log('Conectado ao MongoDB Atlas'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));


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

client.once('ready', () => {
    console.log('Bot online!');

    const guild = client.guilds.cache.get("963833225900355606"); // Opcional: Apenas para um servidor específico!
    if (guild) {
        guild.commands.create({
            name: 'add_farm',
            description: 'Adiciona tintas e papéis ao seu farm',
            options: [
                {
                    name: 'tintas',
                    type: 4,
                    description: 'Quantidade de tintas para adicionar',
                    required: true,
                },
                {
                    name: 'papeis',
                    type: 4,
                    description: 'Quantidade de papéis para adicionar',
                    required: true,
                },
            ],
        });
        guild.commands.create({
            name: 'rm_farm',
            description: 'Remover tintas e papéis do seu farm',
            options: [
                {
                    name: 'tintas',
                    type: 4,
                    description: 'Quantidade de tintas para remover',
                    required: true,
                },
                {
                    name: 'papeis',
                    type: 4,
                    description: 'Quantidade de papéis para remover',
                    required: true,
                },
            ],
        });
        guild.commands.create({
            name: 'add_money',
            description: 'Adicionar dinheiro sujo.',
            options: [
                {
                    name: 'quantidade',
                    type: 4,
                    description: 'Quantidade de dinheiro sujo!',
                    required: true,
                }
            ],
        });
        guild.commands.create({
            name: 'rm_money',
            description: 'Remover dinheiro sujo.',
            options: [
                {
                    name: 'quantidade',
                    type: 4,
                    description: 'Quantidade de dinheiro sujo!',
                    required: true,
                }
            ],
        });
        guild.commands.create({
            name: 'set_nick',
            description: 'Setar o usuario no discord',
            options: [
                {
                    name: 'nome',
                    type: 3, // STRING
                    description: 'Nome do personagem',
                    required: true,
                },
                {
                    name: 'id',
                    type: 3, // STRING
                    description: 'ID na cidade',
                    required: true,
                },
                {
                    name: 'vulgo',
                    type: 3, // STRING
                    description: 'Apelido ou vulgo',
                    required: true,
                },
                {
                    name: 'telefone',
                    type: 3, // STRING
                    description: 'Número de telefone',
                    required: true,
                },
            ],
        });
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options, member, guild } = interaction;
    if (commandName === 'add_farm') {
        const tintas = options.data.find((item: { name: string; }) => item.name === 'tintas')?.value;
        const papeis = options.data.find((item: { name: string; }) => item.name === 'papeis')?.value;
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
        const tintas = options.data.find((item: { name: string; }) => item.name === 'tintas')?.value;
        const papeis = options.data.find((item: { name: string; }) => item.name === 'papeis')?.value;
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
    if (commandName === 'add_money') {
        const quantidade = options.data.find((item: { name: string; }) => item.name === 'quantidade')?.value;
        const userId = interaction.user.id;
        try {
            await updateDirtyMoney(userId, quantidade as number);
            await interaction.reply('Dinheiro adicionado com sucesso!');
        } catch (error) {

            console.error('Erro ao atualizar farm:', error);
            await interaction.reply('Ocorreu um erro ao atualizar seus dados.');
        }
    }
    if (commandName === 'rm_money') {
        const quantidade = options.data.find((item: { name: string; }) => item.name === 'quantidade')?.value;
        const userId = interaction.user.id;
        try {
            await removeDirtyMoney(userId, quantidade as number);
            await interaction.reply('Dinheiro removido com sucesso!');
        } catch (error) {

            console.error('Erro ao atualizar farm:', error);
            await interaction.reply('Ocorreu um erro ao atualizar seus dados.');
        }
    }
    if (commandName === 'set_nick') {
        const nome = options.data.find((item: { name: string; }) => item.name === 'nome')?.value;;
        const id = options.data.find((item: { name: string; }) => item.name === 'id')?.value;;
        const vulgo = options.data.find((item: { name: string; }) => item.name === 'vulgo')?.value;
        const telefone = options.data.find((item: { name: string; }) => item.name === 'telefone')?.value;

        if (!guild || !member || !('setNickname' in member)) {
            await interaction.reply('Não foi possível alterar o apelido. Permissão insuficiente ou erro na execução.');
            return;
        }

        const newNickname = `${vulgo} | ${id}`;
        try {
            await member.setNickname(newNickname);
            await interaction.reply(`Apelido alterado com sucesso para: **${newNickname}**`);
        } catch (error) {
            console.error('Erro ao alterar o apelido:', error);
            await interaction.reply('Não foi possível alterar o apelido. Verifique as permissões do bot.');
            return;
        }

        try {
            const role = guild.roles.cache.get(ROLE_ID_ADD as string);

            if (!role) {
                await interaction.followUp('O cargo especificado não foi encontrado.');
                return;
            }

            const memberRoles = member.roles as GuildMemberRoleManager;
            if (!memberRoles.cache.has(ROLE_ID_ADD as string)) {
                await memberRoles.add(role);
                await memberRoles.remove(ROLE_ID_REMOVE as string);
                await interaction.followUp(`Cargo "${role.name}" atribuído ao usuário.`);
            } else {
                await interaction.followUp(`O usuário já possui o cargo "${role.name}".`);
            }
        } catch (error) {
            console.error('Erro ao gerenciar cargos:', error);
            await interaction.followUp('Ocorreu um erro ao atribuir o cargo.');
        }


        // Enviar dados para o canal especificado
        const logChannel = guild.channels.cache.get(CHANNEL_LOG_ID as string) as TextChannel;
        if (!logChannel) {
            await interaction.followUp('Canal de logs não encontrado. Verifique o ID do canal.');
            return;
        }

        const logMessage = `
            **Novo Registro:**
            - **ID:** ${id}
            - **Nome:** ${nome}
            - **Vulgo:** ${vulgo}
            - **Telefone:** ${telefone}
            - **Apelido Atualizado:** ${newNickname}
        `;

        try {
            await logChannel.send(logMessage);
        } catch (error) {
            console.error('Erro ao enviar mensagem ao canal de logs:', error);
            await interaction.followUp('Não foi possível enviar os dados para o canal de logs.');
        }
    }
});

client.login(BOT_TOKEN);
