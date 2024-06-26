import axios from "axios";
import randomUserAgent from "random-useragent";
import { Configuration } from "./config_manager.js";
import { Logger } from "./logger.js";
const PLATFORMS: { [key: string]: string } = {
    Windows: "Windows",
    macOS: "Mac",
    Linux: "Linux",
    Android: "Android",
    iOS: "iPhone",
    "Windows Phone": "Windows Phone"
};
export const makeGetRequest = async (url: string, headers = {}) => {
    // const proxyAgent = Configuration.getProxyAgent();
    const userAgent = randomUserAgent.getRandom();
    const platform = Object.keys(PLATFORMS).find(key => userAgent.includes(PLATFORMS[key])) || "Windows";

    const CancelToken = axios.CancelToken;
    const source = CancelToken.source();
    const timeoutId = setTimeout(() => {
        source.cancel("Request timed out after 1000ms");
    }, 1500);

    const options = {
        url,
        method: "GET",
        headers: {
            "User-Agent": userAgent,
            "Accept-Encoding": "gzip, deflate, br",
            Platform: platform,
            "Accept-Language": "pl-PL,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
            Referer: "https://vinted.pl/",
            Origin: "https://www.vinted.pl/catalog",
            DNT: "1",
            "Upgrade-Insecure-Requests": "1",
            "Sec-Fetch-Site": "same-origin",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-User": "?1",
            "Sec-Fetch-Dest": "document",
            TE: "Trailers",
            Pragma: "no-cache",
            Priority: "u=0, i",
            ...headers
        },
        // httpsAgent: proxyAgent,
        // httpAgent: proxyAgent,
        responseType: "json" as "json",
        timeout: 1500,
        cancelToken: source.token
    };

    try {
        const response = await axios(options);
        clearTimeout(timeoutId);
        return { response, body: response.data };
    } catch (error: any) {
        const code = error.response ? error.response.status : null;
        if (code === 404) {
            Logger.info("Resource not found.");
        } else if (code === 403) {
            Logger.info("Access forbidden. IP: " + error.response);
        } else if (code === 429) {
            Logger.info("Rate limit exceeded. IP: " + error.response);
        } else {
            Logger.info(`Error making GET request: ${error.message} ${code}`);
        }
    }
};
