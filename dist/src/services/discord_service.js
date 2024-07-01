import axios from "axios";
import { Logger } from "../utils/logger.js";
import { Configuration } from "../../main.js";
const messageQueue = [];
export const enqueueMessage = (message) => {
    messageQueue.push(message);
};
export async function postMessageToChannel(message) {
    const url = `https://discord.com/api/v10/channels/1252290704017719479/messages`;
    const headers = {
        Authorization: `Bot ${Configuration.discordConfig.token}`,
        "Content-Type": "application/json",
        "User-Agent": "DiscordBot (https://your-url.com, 1.0.0)"
    };
    const data = {
        content: message.content,
        embeds: message.embeds || [],
        components: message.components || []
    };
    const options = {
        url,
        method: "POST",
        headers,
        data,
        responseType: "json",
        decompress: true,
        maxContentLength: 10 * 1024 * 1024,
        maxRedirects: 5
    };
    try {
        const response = await axios(options);
        return { response, body: response.data };
    }
    catch (error) {
        const code = error.response ? error.response.status : null;
        if (code === 404) {
            throw new Error("Channel not found.");
        }
        else if (code === 403) {
            throw new Error("Access forbidden.");
        }
        else if (code === 429) {
            Logger.error("Discord 429 too many requests");
        }
        else {
            throw new Error(`Error posting message: ${error.message}`);
        }
    }
}
setInterval(async () => {
    if (messageQueue.length > 0) {
        const message = messageQueue.shift();
        if (message) {
            await postMessageToChannel(message);
        }
    }
}, 500);
