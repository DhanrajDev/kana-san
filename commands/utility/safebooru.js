const { ActionRowBuilder, ButtonBuilder, SlashCommandBuilder } = require('discord.js');
const Booru = require('booru');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('safebooru')
        .setDescription('Search the safebooru database (sfw)!')
        .setNSFW(false)
        .addStringOption(option =>
            option
                .setName('tags')
                .setDescription('Enter the tags to search')
                .setRequired(true)),

    async execute(interaction) {
        try {
            const reply = await interaction.deferReply();
            const msgc = interaction.options.getString('tags').split(' ');
            const results = await Booru.search('safebooru', msgc, { limit: 5, random: true });
            let index = 0;

            if (!results[0]) {
                await interaction.editReply('Nothing found');
                return;
            }

            // Set post URL for the initial result
            const back = new ButtonBuilder().setLabel('◀').setStyle(1).setCustomId('b1').setDisabled(true);
            const ahead = new ButtonBuilder().setLabel('▶').setStyle(1).setCustomId('b2');
            const post = new ButtonBuilder().setLabel('post').setStyle(5).setURL(results[0].postView);
            post.setURL(results[0].postView);

            const buttonRow = new ActionRowBuilder().addComponents(back, ahead, post);

            await interaction.editReply({ content: results[0].fileUrl, components: [buttonRow] });

            const collectorFilter = (i) => i.customId === 'b1' || i.customId === 'b2';
            const collector = reply.createMessageComponentCollector({ collectorFilter, time: 60000 });

            collector.on('collect', async (i) => {
                if (i.customId === 'b1') {
                    index = Math.max(0, index - 1);
                } else if (i.customId === 'b2') {
                    index = Math.min(results.length - 1, index + 1);
                }

                // Update button states and post URL
                back.setDisabled(index === 0);
                ahead.setDisabled(index === results.length - 1);
                post.setURL(results[index]?.postView);

                // Update message with new content and components
                await i.update({ content: results[index]?.fileUrl, components: [buttonRow] });
            });
        } catch (error) {
            console.error('Error executing command:', error);
        }
    },
};