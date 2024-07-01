export class TaskManager {
    taskQueue;
    interval;
    constructor(data) {
        Object.assign(this, data);
    }
    addToQueue(fn) {
        this.taskQueue.push(fn);
    }
    processQueue() {
        setInterval(async () => {
            if (this.taskQueue.length > 0) {
                const nextFn = this.taskQueue.shift();
                console.log(nextFn);
                if (!nextFn)
                    return;
                console.log("Running task");
                await nextFn();
            }
        }, 1500);
    }
}
