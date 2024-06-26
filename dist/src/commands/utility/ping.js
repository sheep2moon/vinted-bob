import { SlashCommandBuilder } from "discord.js";
export const data = new SlashCommandBuilder().setName("ping").setDescription("Odpowiada pong");
export const execute = async (interaction) => {
    await interaction.reply(`Pong ${interaction.user.username}`);
};
