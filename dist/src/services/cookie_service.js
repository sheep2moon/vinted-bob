import axios from "axios";
export async function fetchCookie(url) {
    const response = await axios(url);
    if (response && response.headers["set-cookie"]) {
        const cookies = response.headers["set-cookie"];
        const vintedCookie = cookies.find(cookie => cookie.startsWith("_vinted_fr_session"));
        if (vintedCookie) {
            const cookie = vintedCookie.split(";")[0];
            // Logger.debug(`Fetched cookie: ${cookie}`);
            return { cookie: cookie };
        }
        else {
            throw new Error("Session cookie not found in the headers.");
        }
    }
    throw new Error("No cookies found in the headers.");
}
