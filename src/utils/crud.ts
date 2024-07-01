import { GlobalSettingsModel } from "../database.js";
import { Configuration } from "./config_manager.js";

export const getActiveBrands = async () => {
    const settings = await GlobalSettingsModel.findOne({ id: Configuration.discordConfig.guild_id });
    const activeBrands = Configuration.brands_list.filter(brand => settings?.brands.includes(brand.id));
    return activeBrands;
};
