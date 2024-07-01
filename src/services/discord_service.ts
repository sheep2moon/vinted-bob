import axios from "axios";
import { ActionRowBuilder, AnyComponentBuilder, EmbedBuilder } from "discord.js";
import { Configuration } from "../utils/config_manager.js";

export async function postMessageToChannel(content: string, embeds: EmbedBuilder[] | undefined, components: ActionRowBuilder<AnyComponentBuilder>[] | undefined) {
    const url = `https://discord.com/api/v10/channels/1252290704017719479/messages`;

    const headers = {
        Authorization: `Bot ${Configuration.discordConfig.token}`,
        "Content-Type": "application/json",
        "User-Agent": "DiscordBot (https://your-url.com, 1.0.0)"
    };

    const data = {
        content,
        embeds: embeds || [],
        components: components || []
    };

    const options = {
        url,
        method: "POST",
        headers,
        data,
        responseType: "json" as "json",
        decompress: true,
        maxContentLength: 10 * 1024 * 1024,
        maxRedirects: 5
    };
    try {
        const response = await axios(options);
        return { response, body: response.data };
    } catch (error: any) {
        const code = error.response ? error.response.status : null;
        if (code === 404) {
            throw new Error("Channel not found.");
        } else if (code === 403) {
            throw new Error("Access forbidden.");
        } else {
            throw new Error(`Error posting message: ${error.message}`);
        }
    }
}
