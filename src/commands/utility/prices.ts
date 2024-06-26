import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { GlobalSettingsModel, brandsData } from "../../database.js";
import { Logger } from "../../utils/logger.js";
import { Configuration } from "../../utils/config_manager.js";
import { getBrands } from "../../utils/crud.js";

export const data = new SlashCommandBuilder()
    .setName("prices")
    .setDescription("Zarządzanie minimalną i maksymalną ceną wyszukiwania")
    .addSubcommand(subcommand =>
        subcommand
            .setName("min")
            .setDescription("Ustaw minimalną cene")
            .addNumberOption(option => option.setName("value").setDescription("min cena w PLN").setRequired(true).setMinValue(0).setMaxValue(9999))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("max")
            .setDescription("Ustaw maksymalną cene")
            .addNumberOption(option => option.setName("value").setDescription("max cena w PLN").setRequired(true).setMinValue(0).setMaxValue(9999))
    )
    .addSubcommand(subcommend => subcommend.setName("aktywne").setDescription("Wyświetl obecne wartości min max"));

export const execute = async (interaction: ChatInputCommandInteraction) => {
    try {
        if (interaction.options.getSubcommand() === "min") {
            const newMinPrice = interaction.options.getNumber("value");
            if (newMinPrice && newMinPrice > 0 && newMinPrice < 9999) {
                Configuration.updateMinPrice(newMinPrice);
                await interaction.reply(`Nowa minimalna cena to ${newMinPrice}`);
            } else {
                await interaction.reply("Błąd - nieprawidłowa wartość");
            }
        }
        if (interaction.options.getSubcommand() === "max") {
            const newMaxPrice = interaction.options.getNumber("value");
            if (newMaxPrice && newMaxPrice > 0 && newMaxPrice < 9999) {
                Configuration.updateMaxPrice(newMaxPrice);
                await interaction.reply(`Nowa maksymalna cena to ${newMaxPrice}`);
            } else {
                await interaction.reply("Błąd - nieprawidłowa wartość");
            }
        }
        if (interaction.options.getSubcommand() === "aktywne") {
            await interaction.reply(`Aktywne wartości: MIN - ${Configuration.min_price}, MAX - ${Configuration.max_price}`);
        }

        // const option = interaction.options.getString("lista");
    } catch (error) {
        Logger.error("Brands command execute error");
    }
};
