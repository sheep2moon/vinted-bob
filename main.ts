import { fetchCookie } from "./src/services/cookie_service.js";
import { postMessageToChannel } from "./src/services/discord_service.js";
import { fetchCatalogItems, fetchItemDetails, findHighestId } from "./src/services/vinted_service.js";
import { makeGetRequest } from "./src/utils/http_utils.js";
import { parseItem } from "./src/utils/parse_item.js";
import { createItemEmbed, createVintedItemActionRow } from "./src/utils/embed_builders.js";
import { databaseInit } from "./src/database.js";
import dotenv from "dotenv";
import { botCommandsInit, client } from "./src/client.js";
import { Logger } from "./src/utils/logger.js";
import { Configuration } from "./src/utils/config_manager.js";
dotenv.config();

const getCookie = async () => {
    const c = await fetchCookie("https://www.vinted.pl/catalog?");
    return c.cookie;
};

const refreshCookie = async () => {
    let found = false;
    while (!found) {
        try {
            const cookie = await getCookie();
            if (cookie) {
                found = true;
                return cookie;
            }
        } catch (error) {
            // Logger.debug('Error fetching cookie');
            await new Promise(resolve => setTimeout(resolve, 200));
        }
    }
};

async function startBot() {
    botCommandsInit();
    let cookie = await getCookie();
    await databaseInit();
    await Configuration.populateData();
    const { items } = await fetchCatalogItems(cookie);
    // console.log(items);
    let currentHighestId = findHighestId(items);

    setInterval(async () => {
        const { items } = await fetchCatalogItems(cookie);
        if (items && items.length > 0) {
            let matchingItems = [];
            for (let i = 0; i < 30; i++) {
                if (parseInt(items[i].id) > currentHighestId) matchingItems.push(items[i]);
                else break;
            }
            currentHighestId = findHighestId(items);

            matchingItems.forEach(async i => {
                // console.log(parseItem(item));
                const item = await fetchItemDetails(cookie, i.id);
                const parsedItem = parseItem(item);
                if (!parsedItem) {
                    Logger.error("Problem with item parsing");
                    return;
                }
                const { embed, photosEmbeds } = await createItemEmbed(parsedItem);
                const actionButtons = await createVintedItemActionRow(parsedItem);
                postMessageToChannel(`<@everyone> ${parsedItem.title}`, [embed, ...photosEmbeds], [actionButtons]);
            });
            // console.log("Filtered Items IDs: ", [...matchingItems.map(item => item.id)], "CurrentHighest: ", currentHighestId);
        }
        console.log("Fetching new items");
    }, 3000);

    setInterval(async () => {
        try {
            cookie = (await refreshCookie()) || "";
            Logger.info("Cookie REFRESH");
        } catch (error) {
            Logger.info("Error refreshing cookie");
        }
    }, 60000 * 5); // 60 seconds
}

startBot();
