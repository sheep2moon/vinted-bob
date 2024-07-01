import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Logger } from "../../utils/logger.js";
import { Configuration } from "../../utils/config_manager.js";

export const data = new SlashCommandBuilder()
    .setName("brands")
    .setDescription("Wyświetla dostępne marki produktów")
    .addSubcommand(subcommand => subcommand.setName("lista").setDescription("Wyświetla liste marek"))
    .addSubcommand(subcommand =>
        subcommand
            .setName("dodaj_do_listy")
            .setDescription("Dodaje nową marke do listy wszystkich marek")
            .addStringOption(option => option.setName("brand_name").setDescription("Nazwa marki").setRequired(true))
            .addNumberOption(option => option.setName("brand_id").setDescription("ID marki z Vinted").setRequired(true).setMinValue(1))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("usun_z_listy")
            .setDescription("Usuwa wybraną marke z listy wszystkich marek")
            .addNumberOption(option => option.setName("brand_key").setDescription("Numer marki z listy").setRequired(true).setMinValue(1))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("dodaj")
            .setDescription("Dodaj marke do wyszukiwanych")
            .addNumberOption(option => option.setName("brand_key").setDescription("Numer marki z listy").setRequired(true).setMinValue(1))
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName("usun")
            .setDescription("Usuń marke z listy wyszukiwanych")
            .addNumberOption(option => option.setName("brand_key").setDescription("Numer marki z listy").setRequired(true).setMinValue(1))
    )
    .addSubcommand(subcommend => subcommend.setName("aktywne").setDescription("Wyświetl liste obecnie wyszukiwanych marek"));

export const execute = async (interaction: ChatInputCommandInteraction) => {
    try {
        if (interaction.options.getSubcommand() === "lista") {
            const reply = [...Configuration.brands_list.map(brand => `${brand.key} - ${brand.name}`)].join("\n");
            console.log(Configuration.brands_list);

            await interaction.reply(reply);
        }
        if (interaction.options.getSubcommand() === "dodaj_do_listy") {
            const new_brand_name = interaction.options.getString("brand_name");
            const new_brand_id = interaction.options.getNumber("brand_id");
            if (new_brand_id && new_brand_name) {
                const new_brand_key = Configuration.brands_list.length + 1;
                await Configuration.addNewBrandToList({ id: new_brand_id, name: new_brand_name, key: new_brand_key });
                const reply = `Dodano marke ${new_brand_name} o numerze klucza ${new_brand_key} do listy wszystkich marek.`;
                await interaction.reply(reply);
            }
        }
        if (interaction.options.getSubcommand() === "usun_z_listy") {
            const brand_key = interaction.options.getNumber("brand_key");
            const brand = Configuration.brands_list.find(brand => brand.key === brand_key);
            if (!brand_key || !brand) {
                const reply = `Nie znaleziono marki o podanym numerze`;
                await interaction.reply(reply);
                return;
            }
            await Configuration.removeBrandFromList(brand_key);
            const reply = `Usunięto marke ${brand.name} o numerze klucza ${brand_key} z listy wszystkich marek.`;
            await interaction.reply(reply);
        }
        if (interaction.options.getSubcommand() === "aktywne") {
            const reply = [...Configuration.brands.map(brand => `${brand.key} - ${brand.name}`)].join("\n");
            await interaction.reply(reply);
        }
        if (interaction.options.getSubcommand() === "dodaj") {
            const brand_key = interaction.options.getNumber("brand_key");
            const brand = Configuration.brands_list.find(brand => brand.key === brand_key);
            if (!brand) {
                await interaction.reply("Nie znaleziono marki o podanym numerze.");
                return;
            }
            if (Configuration.brands.find(b => b.id === brand.id)) {
                await interaction.reply(`Marka jest już na liście wyszukiwania!`);
            } else {
                await interaction.reply(`Dodaje markę ${brand.name} do listy wyszukiwania`);
                Configuration.addBrand(brand);
                Logger.info(`DODANO ${brand.name} - ${brand.key}`);
            }
        }
        if (interaction.options.getSubcommand() === "usun") {
            const brand_key = interaction.options.getNumber("brand_key");
            const brand = Configuration.brands_list.find(brand => brand.key === brand_key);
            if (!brand) {
                await interaction.reply("Nie znaleziono marki o podanym numerze.");
                return;
            }
            if (Configuration.brands.find(b => b.id === brand.id)) {
                await interaction.reply(`Usuwam markę ${brand.name} z listy wyszukiwania`);
                Configuration.deleteBrand(brand);
                Logger.info(`USUNIĘTO ${brand.name} - ${brand.key}`);
            } else {
                await interaction.reply(`Marka nie jest na liście wyszukiwania.`);
            }
        }

        // const option = interaction.options.getString("lista");
    } catch (error) {
        Logger.error("Brands command execute error");
    }
};
