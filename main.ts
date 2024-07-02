import { customSearchAndPostItems, searchAndPostItems } from "./src/services/vinted_service.js";
import { databaseInit } from "./src/database.js";
import dotenv from "dotenv";
import { botCommandsInit } from "./src/client.js";
import { ConfigManager } from "./src/utils/config_manager.js";
import { TaskManager } from "./src/utils/task_manager.js";
dotenv.config();

export const Configuration: ConfigManager = new ConfigManager({
    brands: [],
    min_price: 0,
    max_price: 9999,
    discordConfig: {
        client_id: process.env.DISCORD_CLIENT_ID || "",
        token: process.env.DISCORD_TOKEN || "",
        admin_id: process.env.DISCORD_ADMIN_ID || "",
        guild_id: process.env.DISCORD_GUILD_ID || ""
    },
    proxyConfig: {
        host: process.env.PROXY_HOST || "",
        port: parseInt(process.env.PORT || "80"),
        username: process.env.PROXY_USERNAME || "",
        password: process.env.PROXY_PASSWORD || ""
    },
    dev_mode: process.env.DEV_MODE ? true : false,
    custom_search: {
        current_highest_id: 0,
        url: "",
        keywords: []
    },
    cookie: "",
    current_highest_id: 0
});

export const TaskQueueManager: TaskManager = new TaskManager({
    interval: 1500,
    taskQueue: []
});

async function startBot() {
    await databaseInit();
    await Configuration.Init();
    await botCommandsInit();
    TaskQueueManager.processQueue();

    setInterval(async () => {
        TaskQueueManager.addToQueue("SEARCH");
        console.log("Adding Search TASK");
    }, 4000);

    if (Configuration.custom_search.url) {
        setInterval(async () => {
            console.log("Adding SearchCustom TASK");
            TaskQueueManager.addToQueue("CUSTOM_SEARCH");
        }, 8000);
    }

    setInterval(async () => {
        TaskQueueManager.addToQueue("REFRESH_COOKIE");
        console.log("Adding RefreshCookie TASK");
    }, 60000 * 5); // 60seconds * 5
}

startBot();
