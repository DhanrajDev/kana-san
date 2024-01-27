const { ActionRowBuilder, ButtonStyle, ComponentType, ButtonBuilder, SlashCommandBuilder} = require('discord.js')

const rules = [
	{ conditions: { a: 'rock', b: 'scissors' }, result: 'a wins' },
	{ conditions: { a: 'rock', b: 'paper' }, result: 'b wins' },
	{ conditions: { a: 'paper', b: 'rock' }, result: 'a wins' },
	{ conditions: { a: 'paper', b: 'scissors' }, result: 'b wins' },
	{ conditions: { a: 'scissors', b: 'paper' }, result: 'a wins' },
	{ conditions: { a: 'scissors', b: 'rock' }, result: 'b wins' },
];

function checkWinner(a, b) {
	for (let rule of rules) {
		const conditionsMet = Object.keys(rule.conditions).every(key => rule.conditions[key] === (key === 'a' ? a : b));
		if (conditionsMet) {
			return rule.result;
		}
	}
	return 'no';
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('rock-paper-scissors')
		.setDescription('Play Rock-Paper-Scissors with your friends!').addUserOption(option =>
			option.setName('opponent').setDescription('The opponent you want to fight').setRequired(true)
		),
	async execute(interaction) {
		const rock = new ButtonBuilder().setLabel('Rock✊').setCustomId('rock').setStyle(ButtonStyle.Primary)
		const paper = new ButtonBuilder().setLabel('Paper🤚').setCustomId('paper').setStyle(ButtonStyle.Primary)
		const scissors = new ButtonBuilder().setLabel('Scissors✌').setCustomId('scissors').setStyle(ButtonStyle.Primary)
		const buttonrow = new ActionRowBuilder().addComponents(rock, paper, scissors)
		var resulted;
		try {
			let usermove = null;
			let oppmove = null;
			const chUser = interaction.options.getUser('opponent');

			if (!chUser) {
				await interaction.reply({content:"User not found!", ephemeral:true});
				return;
			}

			if(chUser.id != '1086677485548224683' && chUser.bot){
				await interaction.reply({content:"You can't play against a bot! [except me (◕‿◕✿)]", ephemeral:true});
				return;
			}

			if(interaction.user.id==chUser.id){
				await interaction.reply({content:"You can't play against yourself!", ephemeral:true});
				return;
			}

			const reply = await interaction.reply({ content: `<@${interaction.user.id}> challenges <@${chUser.id}> for rock-paper-scissors.`, components: [buttonrow] });
			const Collector = reply.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });
			Collector.on('collect', (i) => {
				i.deferUpdate();
				if (i.user.id === interaction.user.id) {
					if (!usermove) { usermove = i.customId; i.reply({ content: `You chose ${usermove}`, ephemeral: true }) }
				} else if (i.user.id === chUser.id) {
					if (!oppmove) { oppmove = i.customId; i.reply({ content: `You chose ${oppmove}`, ephemeral: true }) }
				} else { i.reply({ content: `You are not playing.`, ephemeral: true }) }
				if (chUser.id === '1086677485548224683') {
					psMoves = ['rock', 'paper', 'scissors']
					oppmove = psMoves[Math.floor(Math.random() * 3)]
				}
				if (usermove && oppmove) {
					const result = checkWinner(usermove, oppmove)
					paper.setDisabled(true); rock.setDisabled(true); scissors.setDisabled(true);
					if (result == 'a wins') {
						reply.edit({ content: `<@${interaction.user.id}> wins against <@${chUser.id}> by choosing ${usermove} over ${oppmove}`, components: [buttonrow] })
					} else if (result === 'b wins') {
						reply.edit({ content: `<@${chUser.id}> wins against <@${interaction.user.id}> by choosing ${oppmove} over ${usermove}`, components: [buttonrow] })
					} else {
						reply.edit({ content: `<@${interaction.user.id}> vs <@${chUser.id}> drawed with ${usermove}`, components: [buttonrow] })
					}

					usermove = null; oppmove = null;
					resulted = true;
				}
			})
			Collector.on('end', (i) => {
				if (!resulted) reply.edit({ content: `Reponses on both sides wasn't recived.`, components: [] })
			})


		} catch (error) {
			console.error('Error executing command:', error);
		}
	}
};