import { fetchCookie } from "./src/services/cookie_service.js";
import { enqueueMessage } from "./src/services/discord_service.js";
import { fetchCatalogItems, fetchItemDetails, findHighestId, searchAndPostItems } from "./src/services/vinted_service.js";
import { makeGetRequest } from "./src/utils/http_utils.js";
import { parseItem } from "./src/utils/parse_item.js";
import { createItemEmbed, createVintedItemActionRow } from "./src/utils/embed_builders.js";
import { databaseInit } from "./src/database.js";
import dotenv from "dotenv";
import { botCommandsInit, client } from "./src/client.js";
import { Logger } from "./src/utils/logger.js";
import { Configuration } from "./src/utils/config_manager.js";
dotenv.config();

async function startBot() {
    await botCommandsInit();
    await databaseInit();
    await Configuration.Init();

    setInterval(async () => {
        await searchAndPostItems();
        console.log("searchAndPostItems");
    }, 3000);

    setInterval(async () => {
        await Configuration.refreshCookie();
    }, 60000 * 5); // 60seconds * 5
}

startBot();
