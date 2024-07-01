import { Client, Events, GatewayIntentBits } from "discord.js";
import { Logger } from "./utils/logger.js";
import { handleCommands, registerCommands } from "./commands/commands_handler.js";
import { Configuration } from "../main.js";
export const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});
export const botCommandsInit = async () => {
    client.once("ready", async () => {
        Logger.info("Discord client ready");
        await registerCommands(client, Configuration.discordConfig);
        client.user?.setPresence({ activities: [{ name: "Szukam itemów na Vinted" }], status: "online" });
    });
    client.login(Configuration.discordConfig.token).then(token => {
        Logger.info(`Discord Client logged in as ${client.user?.tag}`);
    });
    client.on("", () => {
        Logger.info("Ohoo");
    });
    client.on(Events.InteractionCreate, handleCommands);
};
