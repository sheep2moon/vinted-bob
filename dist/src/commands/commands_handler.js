import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Logger } from "../utils/logger.js";
import { REST, Routes } from "discord.js";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const commandFiles = fs.readdirSync(path.join(__dirname, "utility")).filter(file => file.endsWith(".js"));
async function loadCommands() {
    const commands = [];
    for (const file of commandFiles) {
        Logger.info("Import command");
        const module = await import(`./utility/${file}`);
        commands.push(module.data.toJSON());
    }
    return commands;
}
export async function registerCommands(client, discordConfig) {
    const commands = await loadCommands(); // Ensure all commands are loaded before registering
    const rest = new REST({ version: "10" }).setToken(discordConfig.token);
    try {
        Logger.info("refreshing app / commands.");
        console.log(commands);
        // await rest.put(Routes.applicationCommands(discordConfig.client_id), { body: commands });
        const data = await rest.put(Routes.applicationGuildCommands(discordConfig.client_id, discordConfig.guild_id), { body: commands });
        Logger.info(`reloaded ${data} application / commands.`);
    }
    catch (error) {
        Logger.error(`Error reloading commands ${error}`);
    }
}
export async function handleCommands(interaction) {
    Logger.info("Interactionc");
    if (!interaction.isCommand())
        return;
    try {
        const module = await import(`./utility/${interaction.commandName}.js`);
        await module.execute(interaction);
    }
    catch (error) {
        Logger.error(`Error handling command ${error}`);
        await interaction.followUp({ content: "Error - handleCommands", ephemeral: true });
    }
}