import fs from "fs";
import path from "path";
export class Logger {
    static logFilePath = path.join(process.cwd(), "app.log");
    static initialize() {
        if (!fs.existsSync(Logger.logFilePath)) {
            fs.writeFileSync(Logger.logFilePath, "");
        }
    }
    static info(message) {
        Logger.log("INFO", message);
    }
    static warn(message) {
        Logger.log("WARN", message);
    }
    static error(message) {
        Logger.log("ERROR", message);
    }
    static debug(message) {
        Logger.log("DEBUG", message);
    }
    static log(level, message) {
        const timestamp = new Date().toISOString();
        let logMessage = `${timestamp} ${level}: ${message}`;
        console.log(logMessage);
        fs.appendFileSync(Logger.logFilePath, `${logMessage}\n`);
    }
}
Logger.initialize();
// export default Logger;
