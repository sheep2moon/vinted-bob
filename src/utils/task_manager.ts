import { Configuration } from "../../main.js";
import { customSearchAndPostItems, searchAndPostItems } from "../services/vinted_service.js";

type Task = "SEARCH" | "CUSTOM_SEARCH" | "REFRESH_COOKIE";

interface ITaskManager {
    taskQueue: Task[];
    interval: number;
}

export class TaskManager implements ITaskManager {
    taskQueue: Task[];
    interval: number;

    constructor(data: ITaskManager) {
        Object.assign(this, data);
    }

    addToQueue(task: Task) {
        this.taskQueue.push(task);
    }

    processQueue() {
        setInterval(async () => {
            if (this.taskQueue.length > 0) {
                const nextTask = this.taskQueue.shift();
                if (!nextTask) return;
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
