import { Configuration } from "../../main.js";
import { customSearchAndPostItems, searchAndPostItems } from "../services/vinted_service.js";
export class TaskManager {
    taskQueue;
    interval;
    constructor(data) {
        Object.assign(this, data);
    }
    addToQueue(task) {
        this.taskQueue.push(task);
    }
    processQueue() {
        setInterval(async () => {
            if (this.taskQueue.length > 0) {
                const nextTask = this.taskQueue.shift();
                if (!nextTask)
                    return;
                console.log("Running task");
                if (nextTask === "SEARCH") {
                    await searchAndPostItems();
                }
                if (nextTask === "CUSTOM_SEARCH") {
                    await customSearchAndPostItems();
                }
                if (nextTask === "REFRESH_COOKIE") {
                    await Configuration.refreshCookie();
                }
            }
        }, 1500);
    }
}
