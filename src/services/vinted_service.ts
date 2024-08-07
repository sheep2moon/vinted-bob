import { AxiosResponse } from "axios";
import { makeGetRequest } from "../utils/http_utils.js";
import { RawItem, parseItem } from "../utils/parse_item.js";
import { Logger } from "../utils/logger.js";
import { createItemEmbed, createVintedItemActionRow } from "../utils/embed_builders.js";
import { enqueueMessage } from "./discord_service.js";
import { Configuration } from "../../main.js";

type CatalogItemsResponse = {
    response: AxiosResponse<any, any>;
    body: {
        items: any[];
    };
};

export function findHighestId(items: RawItem[]) {
    return Math.max(...items.map(item => parseInt(item.id)));
}

function findIdMatchingItems(items: RawItem[], highest_id: number) {
    let matchingItems = [];
    for (let i = 0; i < 30; i++) {
        if (parseInt(items[i].id) > highest_id) matchingItems.push(items[i]);
        else break;
    }
    return matchingItems;
}

async function postItems(items: RawItem[], channelId?: string) {
    items.forEach(async i => {
        const item = await fetchItemDetails(i.id);
        const parsedItem = parseItem(item);
        if (!parsedItem) {
            Logger.error("Problem with item parsing");
            return;
        }
        const { embed, photosEmbeds } = await createItemEmbed(parsedItem);
        const actionButtons = await createVintedItemActionRow(parsedItem);
        enqueueMessage({
            message: {
                content: `<@everyone> ${parsedItem.title}`,
                embeds: [embed, ...photosEmbeds],
                components: [actionButtons]
            },
            channelId
        });
    });
}

export async function fetchCatalogItemsByUrl(url_query: string): Promise<{ items: RawItem[] }> {
    const url = `https://www.vinted.pl/api/v2/catalog/items?per_page=30&order=newest_first&${url_query}`;
    const cookie = Configuration.cookie;
    console.log("SEARCH cookie: ", cookie);

    const headers = { Cookie: cookie };
    let response: CatalogItemsResponse | undefined = undefined;
    response = await makeGetRequest(url, headers);
    if (response) return { items: response.body.items };
    return { items: [] };
}

export async function fetchCatalogItems() {
    const brandsQuery = Configuration.brands.map(brand => `brand_ids[]=${brand.id}`).join("&");
    const priceQuery = `price_from=${Configuration.min_price}&currency=PLN&price_to=${Configuration.max_price}`;
    const url_query = `${brandsQuery}&${priceQuery}`;
    return await fetchCatalogItemsByUrl(url_query);
}

export async function fetchCustomCatalogItems() {
    const url_query = Configuration.custom_search.url;
    return await fetchCatalogItemsByUrl(url_query);
}

export async function fetchItemDetails(item_id: string) {
    const url = `https://www.vinted.pl/api/v2/items/${item_id}`;
    const headers = { Cookie: Configuration.cookie };
    let response = null;
    while (!response) {
        response = await makeGetRequest(url, headers);
        console.log(response?.body);

        if (response) return response.body.item;
        console.log("fetchItemDetails - undefined... Retrying after 1sec.");
        setTimeout(() => {}, 1000);
    }
}

export async function customSearchAndPostItems() {
    const { items } = await fetchCustomCatalogItems();
    if (items && items.length > 0) {
        const idMatchingItems = findIdMatchingItems(items, Configuration.custom_search.current_highest_id);
        const keywords = Configuration.custom_search.keywords;
        let matchingItems = [];
        for (let i = 0; i < 30; i++) {
            if (keywords.some(keyword => idMatchingItems[i].title.includes(keyword))) matchingItems.push(idMatchingItems[i]);
            else break;
        }
        if (matchingItems && matchingItems.length > 0) {
            Configuration.setCustomSearchCurrentHighestId(findHighestId(items));
            postItems(matchingItems, "1257446225196748800");
        }
    }
}

export async function searchAndPostItems() {
    const { items } = await fetchCatalogItems();
    if (items && items.length > 0) {
        const matchingItems = findIdMatchingItems(items, Configuration.current_highest_id);
        if (matchingItems && matchingItems.length > 0) {
            Configuration.setCurrentHighestId(findHighestId(matchingItems));
            postItems(matchingItems);
        }
    }
}
