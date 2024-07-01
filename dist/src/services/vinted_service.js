import { makeGetRequest } from "../utils/http_utils.js";
import { parseItem } from "../utils/parse_item.js";
import { Logger } from "../utils/logger.js";
import { createItemEmbed, createVintedItemActionRow } from "../utils/embed_builders.js";
import { enqueueMessage } from "./discord_service.js";
import { Configuration } from "../../main.js";
export async function fetchCatalogItems(cookie) {
    const brandsQuery = Configuration.brands.map(brand => `brand_ids[]=${brand.id}`).join("&");
    const priceQuery = `price_from=${Configuration.min_price}&currency=PLN&price_to=${Configuration.max_price}`;
    const url = `https://www.vinted.pl/api/v2/catalog/items?per_page=30&order=newest_first&${brandsQuery}&${priceQuery}`;
    console.log(url);
    const headers = { Cookie: cookie };
    let response = undefined;
    response = await makeGetRequest(url, headers);
    if (response)
        return { items: response.body.items };
    return { items: [] };
}
export async function fetchItemDetails(cookie, item_id) {
    const url = `https://www.vinted.pl/api/v2/items/${item_id}`;
    const headers = { Cookie: cookie };
    let response = null;
    while (!response) {
        response = await makeGetRequest(url, headers);
        console.log(response?.body);
        if (response)
            return response.body.item;
        console.log("fetchItemDetails - undefined... Retrying after 1sec.");
        setTimeout(() => { }, 1000);
    }
}
export async function searchAndPostItems() {
    const cookie = Configuration.cookie;
    const { items } = await fetchCatalogItems(cookie);
    if (items && items.length > 0) {
        let matchingItems = [];
        for (let i = 0; i < 30; i++) {
            if (parseInt(items[i].id) > Configuration.current_highest_id)
                matchingItems.push(items[i]);
            else
                break;
        }
        Configuration.setCurrentHighestId(findHighestId(items));
        matchingItems.forEach(async (i) => {
            const item = await fetchItemDetails(cookie, i.id);
            const parsedItem = parseItem(item);
            if (!parsedItem) {
                Logger.error("Problem with item parsing");
                return;
            }
            const { embed, photosEmbeds } = await createItemEmbed(parsedItem);
            const actionButtons = await createVintedItemActionRow(parsedItem);
            enqueueMessage({
                content: `<@everyone> ${parsedItem.title}`,
                embeds: [embed, ...photosEmbeds],
                components: [actionButtons]
            });
        });
    }
}
export function findHighestId(items) {
    return Math.max(...items.map(item => parseInt(item.id)));
}
