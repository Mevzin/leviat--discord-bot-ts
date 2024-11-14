import 'dotenv/config'
import { Client, GatewayIntentBits, CommandInteraction, EmbedBuilder } from 'discord.js';
import mongoose from 'mongoose';
import UserFarm from './models/UserFarm';
import { configDotenv } from 'dotenv';
import farmCommands from './commands/farm';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;

// Conectando ao MongoDB Atlas
mongoose.connect(MONGO_URI as string)
    .then(() => console.log('Conectado ao MongoDB Atlas'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

// Função para atualizar ou criar dados do usuário


client.once('ready', () => {
    console.log('Bot online!');
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options } = interaction;
    farmCommands(commandName, options, interaction)
});

client.login(BOT_TOKEN);
