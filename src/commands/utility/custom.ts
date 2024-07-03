import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Logger } from "../../utils/logger.js";
import { Configuration } from "../../../main.js";
import { isValidHttpUrl } from "../../utils/http_utils.js";

export const data = new SlashCommandBuilder()
    .setName("custom")
    .setDescription("Zarządzanie customowym wyszukiwaniem")
    .addSubcommand(subcommand =>
        subcommand
            .setName("url_query")
            .setDescription("Ustaw parametry z Vinted")
            .addStringOption(option => option.setName("url_query").setDescription("Query parameters").setRequired(true))
            .addStringOption(option => option.setName("keywords").setDescription("Słowa kluczowe oddzielone spacją, np: 530,550").setRequired(false))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("slowa_kluczowe")
            .setDescription("Ustaw słowa kluczowe które będą wyszukiwane w tytule aukcji")
            .addStringOption(option => option.setName("keywords").setDescription("Słowa kluczowe oddzielone spacją, np: 530,550").setRequired(true))
    )
    .addSubcommand(subcommend => subcommend.setName("aktywne").setDescription("Wyświetl obecne wyszukiwanie"));

export const execute = async (interaction: ChatInputCommandInteraction) => {
    try {
        if (interaction.options.getSubcommand() === "url_query") {
            const url_query = interaction.options.getString("url_query");
            const keywords = interaction.options.getString("keywords")?.split(",");
            if (url_query) {
                await Configuration.updateCustomSearchUrl(url_query);
                if (keywords) await Configuration.updateCustomSearchKeywords(keywords);
                const reply = `Ustawiono wyszukiwanie przedmiotów - ${url_query}`;
                await interaction.reply(reply);
            }
            await interaction.reply("Coś poszło nie tak, sprawdź czy adres URL jest prawidłowy");
        }
        if (interaction.options.getSubcommand() === "slowa_kluczowe") {
            const keywords = interaction.options.getString("keywords")?.split(",");
            if (keywords) {
                Configuration.updateCustomSearchKeywords(keywords);
                await interaction.reply(`Nowe słowa kluczowe to - ${keywords?.join(", ")}`);
            } else {
                await interaction.reply("Błąd, nieprawidłowa wartość");
            }
        }
        if (interaction.options.getSubcommand() === "aktywne") {
            await interaction.reply(`Obecnie wyszukiwane, URL: ${Configuration.custom_search.url} \n Słowa kluczowe: ${Configuration.custom_search.keywords.join(", ")}`);
        }
    } catch (error) {
        Logger.error("Custom search command execute error");
    }
};
