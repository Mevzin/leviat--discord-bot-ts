import 'dotenv/config'
import { configDotenv } from 'dotenv';
import { Client, GatewayIntentBits, EmbedBuilder, TextChannel, GuildMemberRoleManager, ActivityType } from 'discord.js';
import mongoose from 'mongoose';
import UserFarm from './models/UserFarm';
import UserDirtyMoney from './models/UserDirtyMoney';
import globalCommandsHandler from './commands';


const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const BOT_TOKEN = process.env.BOT_TOKEN;
const MONGO_URI = process.env.MONGO_URI;
const CHANNEL_LOG_ID = process.env.ID_CHANNEL_LOG;
const ROLE_ID_ADD = process.env.ROLE_ID_ADD;
const ROLE_ID_REMOVE = process.env.ROLE_ID_REMOVE;
const GUILD_ID = process.env.GUILD_ID;

mongoose.connect(MONGO_URI as string)
    .then(() => console.log('Conectado ao MongoDB Atlas'))
    .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

client.once('ready', async () => {
    console.log('Bot online!');

    const updateStatus = async () => {
        try {
            const guilds = client.guilds.cache;
            let totalMembers = 0;

            for (const guild of guilds.values()) {
                const fetchedGuild = await guild.fetch();
                totalMembers += fetchedGuild.memberCount;
            }

            client.user?.setPresence({
                activities: [
                    {
                        name: `${totalMembers} usuários!`,
                        type: ActivityType.Watching,
                    },
                ],
                status: 'idle',
            });
        } catch (error) {
            console.error('Erro ao atualizar status:', error);
        }
    };

    const guild = client.guilds.cache.get(GUILD_ID as string); // Opcional: Apenas para um servidor específico!
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
            name: 'list_farm',
            description: 'Lista todos os usuários e seus farms (tintas e papéis).',
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
        guild.commands.create({
            name: 'list_money',
            description: 'Lista todos os usuários e seus saldos em dinheiro sujo.',
        });
    }
    await updateStatus();
    setInterval(updateStatus, 10 * 60 * 1000);
});

client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand()) return;

    const { commandName, options, member, guild } = interaction;
    globalCommandsHandler(commandName, options, member, guild, interaction)

    if (commandName === 'set_nick') {
        const nome = options.data.find((item: { name: string; }) => item.name === 'nome')?.value;;
        const id = options.data.find((item: { name: string; }) => item.name === 'id')?.value;;
        const vulgo = options.data.find((item: { name: string; }) => item.name === 'vulgo')?.value;
        const telefone = options.data.find((item: { name: string; }) => item.name === 'telefone')?.value;

        const embedMessage = new EmbedBuilder()
            .setColor(0xc40404)
            .setTitle('Comando desabilitado 😢')
            .setDescription('No momento esta interação esta desativada, tente novamente mais tarde!')
            .setTimestamp();
        await interaction.reply({ embeds: [embedMessage] });

        // if (!guild || !member || !('setNickname' in member)) {
        //     await interaction.reply('Não foi possível alterar o apelido. Permissão insuficiente ou erro na execução.');
        //     return;
        // }

        // const newNickname = `${vulgo} | ${id}`;
        // try {
        //     await member.setNickname(newNickname);
        //     await interaction.reply(`Apelido alterado com sucesso para: **${newNickname}**`);
        // } catch (error) {
        //     console.error('Erro ao alterar o apelido:', error);
        //     await interaction.reply('Não foi possível alterar o apelido. Verifique as permissões do bot.');
        //     return;
        // }

        // try {
        //     const role = guild.roles.cache.get(ROLE_ID_ADD as string);

        //     if (!role) {
        //         await interaction.followUp('O cargo especificado não foi encontrado.');
        //         return;
        //     }

        //     const memberRoles = member.roles as GuildMemberRoleManager;
        //     if (!memberRoles.cache.has(ROLE_ID_ADD as string)) {
        //         await memberRoles.add(role);
        //         await memberRoles.remove(ROLE_ID_REMOVE as string);
        //         await interaction.followUp(`Cargo "${role.name}" atribuído ao usuário.`);
        //     } else {
        //         await interaction.followUp(`O usuário já possui o cargo "${role.name}".`);
        //     }
        // } catch (error) {
        //     console.error('Erro ao gerenciar cargos:', error);
        //     await interaction.followUp('Ocorreu um erro ao atribuir o cargo.');
        // }


        // // Enviar dados para o canal especificado
        // const logChannel = guild.channels.cache.get(CHANNEL_LOG_ID as string) as TextChannel;
        // if (!logChannel) {
        //     await interaction.followUp('Canal de logs não encontrado. Verifique o ID do canal.');
        //     return;
        // }

        // const embedMessage = new EmbedBuilder()
        //     .setColor(0x0099ff)
        //     .setTitle('Novo registro de usuario')
        //     .addFields(
        //         { name: 'ID:', value: `${id}`, inline: false },
        //         { name: 'Nome', value: `${nome}`, inline: false },
        //         { name: 'Vulgo:', value: `${vulgo}`, inline: false },
        //         { name: 'Telefone', value: `${telefone}`, inline: false },
        //         { name: 'Nick atualizado', value: `${newNickname}`, inline: false },
        //     )
        //     .setTimestamp();

        // try {
        //     await logChannel.send({ embeds: [embedMessage] });
        // } catch (error) {
        //     console.error('Erro ao enviar mensagem ao canal de logs:', error);
        //     await interaction.followUp('Não foi possível enviar os dados para o canal de logs.');
        // }
    }

});

client.login(BOT_TOKEN);
