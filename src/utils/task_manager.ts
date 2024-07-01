interface ITaskManager {
    taskQueue: (() => Promise<void>)[];
    interval: number;
}

export class TaskManager implements ITaskManager {
    taskQueue: (() => Promise<void>)[];
    interval: number;

    constructor(data: ITaskManager) {
        Object.assign(this, data);
    }

    addToQueue(fn: ITaskManager["taskQueue"][number]) {
        this.taskQueue.push(fn);
    }

    processQueue() {
        setInterval(async () => {
            if (this.taskQueue.length > 0) {
                const nextFn = this.taskQueue.shift();
                console.log(nextFn);
                if (!nextFn) return;
                console.log("Running task");

                await nextFn();
            }
        }, 1500);
    }
}
