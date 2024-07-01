import axios from "axios";
import { Logger } from "../utils/logger.js";

export async function fetchCookie(url: string) {
    const response = await axios(url);

    if (response && response.headers["set-cookie"]) {
        const cookies = response.headers["set-cookie"];
        const vintedCookie = cookies.find(cookie => cookie.startsWith("_vinted_fr_session"));
        if (vintedCookie) {
            const cookie = vintedCookie.split(";")[0];
            Logger.info(`Fetched cookie: ${cookie}`);

            return { cookie: cookie };
        } else {
            throw new Error("Session cookie not found in the headers.");
        }
    }

    throw new Error("No cookies found in the headers.");
}
