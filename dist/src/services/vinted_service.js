import { makeGetRequest } from "../utils/http_utils.js";
import { Configuration } from "../utils/config_manager.js";
export async function fetchCatalogItems(cookie) {
    const brandsQuery = Configuration.brands.map(brand => `brand_ids[]=${brand.id}`).join("&");
    const priceQuery = `price_from=${Configuration.min_price}&currency=PLN&price_to=${Configuration.max_price}`;
    const url = `https://www.vinted.pl/api/v2/catalog/items?per_page=30&order=newest_first&${brandsQuery}&${priceQuery}`;
    const headers = { Cookie: cookie };
    let response = undefined;
    response = await makeGetRequest(url, headers);
    if (response)
        return { items: response.body.items };
    // while (!response) {
    //     response = await makeGetRequest(url, headers);
    //     console.log("fetchCatalogItems - undefined... Retrying after 1sec.");
    //     setTimeout(() => {}, 1000);
    // }
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
// export async function findHighestId(cookie: string) {
//     const { items } = await fetchCatalogItems(cookie);
//     if (!items) {
//         throw new Error("Error fetching catalog items.");
//     }
//     const maxID = Math.max(...items.map(item => parseInt(item.id)));
//     return maxID;
// }
export function findHighestId(items) {
    return Math.max(...items.map(item => parseInt(item.id)));
}
