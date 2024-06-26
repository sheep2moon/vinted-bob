import { SlashCommandBuilder } from "discord.js";
import { brandsData } from "../../database.js";
import { Logger } from "../../utils/logger.js";
import { Configuration } from "../../utils/config_manager.js";
export const data = new SlashCommandBuilder()
    .setName("brands")
    .setDescription("Wyświetla dostępne marki produktów")
    .addSubcommand(subcommand => subcommand.setName("lista").setDescription("Wyświetla liste marek"))
    .addSubcommand(subcommand => subcommand
    .setName("dodaj")
    .setDescription("Dodaj marke do wyszukiwanych")
    .addNumberOption(option => option.setName("brand_key").setDescription("Numer marki z listy").setRequired(true).setMinValue(1))
// .addNumberOption(option =>
//     option
//         .setName("brand_id")
//         .setDescription("ID marki")
//         .setRequired(true)
//         .addChoices(...brandsData.map(brand => ({ name: brand.name, value: brand.id })))
// )
)
    .addSubcommand(subcommand => subcommand
    .setName("usun")
    .setDescription("Usuń marke z listy wyszukiwanych")
    .addNumberOption(option => option.setName("brand_key").setDescription("Numer marki z listy").setRequired(true).setMinValue(1)))
    .addSubcommand(subcommend => subcommend.setName("aktywne").setDescription("Wyświetl liste obecnie wyszukiwanych marek"));
export const execute = async (interaction) => {
    try {
        if (interaction.options.getSubcommand() === "lista") {
            const reply = [...brandsData.map(brand => `${brand.key} - ${brand.name}`)].join("\n");
            await interaction.reply(reply);
        }
        if (interaction.options.getSubcommand() === "aktywne") {
            const reply = [...Configuration.brands.map(brand => `${brand.key} - ${brand.name}`)].join("\n");
            await interaction.reply(reply);
        }
        if (interaction.options.getSubcommand() === "dodaj") {
            const brand_key = interaction.options.getNumber("brand_key");
            const brand = brandsData.find(brand => brand.key === brand_key);
            if (!brand) {
                await interaction.reply("Nie znaleziono marki o podanym numerze.");
                return;
            }
            if (Configuration.brands.find(b => b.id === brand.id)) {
                await interaction.reply(`Marka jest już na liście wyszukiwania!`);
            }
            else {
                await interaction.reply(`Dodaje markę ${brand.name} do listy wyszukiwania`);
                Configuration.addBrand(brand);
                Logger.info(`DODANO ${brand.name} - ${brand.key}`);
            }
        }
        if (interaction.options.getSubcommand() === "usun") {
            const brand_key = interaction.options.getNumber("brand_key");
            const brand = brandsData.find(brand => brand.key === brand_key);
            if (!brand) {
                await interaction.reply("Nie znaleziono marki o podanym numerze.");
                return;
            }
            if (Configuration.brands.find(b => b.id === brand.id)) {
                await interaction.reply(`Usuwam markę ${brand.name} z listy wyszukiwania`);
                Configuration.deleteBrand(brand);
                Logger.info(`USUNIĘTO ${brand.name} - ${brand.key}`);
            }
            else {
                await interaction.reply(`Marka nie jest na liście wyszukiwania.`);
            }
        }
        // const option = interaction.options.getString("lista");
    }
    catch (error) {
        Logger.error("Brands command execute error");
    }
};
