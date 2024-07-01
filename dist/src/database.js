import dotenv from "dotenv";
import mongoose, { Schema, model } from "mongoose";
import { Logger } from "./utils/logger.js";
dotenv.config();
const mongoConfig = {
    uri: process.env.MONGODB_URI
};
export const databaseInit = async () => {
    if (!mongoConfig.uri) {
        Logger.error("No mongodb_uri provided.");
        return;
    }
    await mongoose
        .connect(mongoConfig.uri)
        .then(() => Logger.info("Connected to DB"))
        .catch(err => Logger.error(err));
};
const settingsSchema = new Schema({
    id: { type: Number, unique: true, default: 1252287305801007124 },
    brands: [{ type: Number }],
    min_price: { type: Number, min: 0, default: 0 },
    max_price: { type: Number, default: 9999 }
});
export const GlobalSettingsModel = model("GlobalSettings", settingsSchema);
