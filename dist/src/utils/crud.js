import { GlobalSettingsModel, brandsData } from "../database.js";
import { Configuration } from "./config_manager.js";
export const getBrands = async () => {
    const settings = await GlobalSettingsModel.findOne({ id: Configuration.discordConfig.guild_id });
    const activeBrands = brandsData.filter(brand => settings?.brands.includes(brand.id));
    return activeBrands;
};
