import 'dotenv/config'
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import mongoose from 'mongoose';
import UserFarm from './models/UserFarm';
import { configDotenv } from 'dotenv';
import UserDirtyMoney from './models/UserDirtyMoney';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;

// Conectando ao MongoDB Atlas
mongoose.connect(MONGO_URI as string)
    .then(() => console.log('Conectado ao MongoDB Atlas'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Função para atualizar ou criar dados do usuário

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
    }
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
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
            await updateDirtyMoney(userId, quantidade as number);
            await interaction.reply('Dinheiro removido com sucesso!');
        } catch (error) {

            console.error('Erro ao atualizar farm:', error);
            await interaction.reply('Ocorreu um erro ao atualizar seus dados.');
        }
    }
});

client.login(BOT_TOKEN);
