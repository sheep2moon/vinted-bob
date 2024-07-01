import dotenv from "dotenv";
import { GlobalSettingsModel } from "../database.js";
import { SocksProxyAgent } from "socks-proxy-agent";
import { addNewBrandToBrandsFile, getBrandsListFromFile } from "../brands_data.js";
dotenv.config();
class ConfigManager {
    brands;
    brands_list;
    dev_mode;
    min_price;
    max_price;
    discordConfig;
    proxyConfig;
    constructor(data) {
        Object.assign(this, data);
    }
    async addBrand(brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(Configuration.discordConfig.guild_id) }, { $addToSet: { brands: brand.id } });
        this.brands.push(brand);
    }
    async deleteBrand(brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(Configuration.discordConfig.guild_id) }, { $pull: { brands: brand.id } });
        this.brands = [...this.brands.filter(b => b.id !== brand.id)];
    }
    // async updateBrands(brands: Brand[]) {
    //     this.brands = brands;
    // }
    async updateMinPrice(minPrice) {
        this.min_price = minPrice;
        await GlobalSettingsModel.updateOne({ id: Configuration.discordConfig.guild_id }, { max_price: minPrice });
    }
    async updateMaxPrice(maxPrice) {
        this.max_price = maxPrice;
        await GlobalSettingsModel.updateOne({ id: Configuration.discordConfig.guild_id }, { max_price: maxPrice });
    }
    getProxyAgent() {
        const proxyURI = `socks://${this.proxyConfig.username}:${this.proxyConfig.password}@${this.proxyConfig.host}:${this.proxyConfig.port}`;
        const agent = new SocksProxyAgent(proxyURI);
        return agent;
    }
    async addNewBrandToList(newBrand) {
        const newBrandsList = await addNewBrandToBrandsFile(newBrand);
        if (newBrandsList) {
            this.brands_list = newBrandsList;
        }
    }
    async populateData() {
        let settings = await GlobalSettingsModel.findOne({ id: Configuration.discordConfig.guild_id });
        const brandsList = await getBrandsListFromFile();
        this.brands_list = brandsList;
        if (!settings) {
            await GlobalSettingsModel.create({
                id: Configuration.discordConfig.guild_id,
                min_price: 1,
                max_price: 9999,
                brands: this.brands_list.map(brand => brand.id)
            });
            settings = await GlobalSettingsModel.findOne({ id: Configuration.discordConfig.guild_id });
        }
        const activeBrands = this.brands_list.filter(brand => settings?.brands.includes(brand.id));
        this.brands = activeBrands;
        this.min_price = settings?.min_price || 0;
        this.max_price = settings?.max_price || 9999;
    }
}
export const Configuration = new ConfigManager({
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
    dev_mode: process.env.DEV_MODE ? true : false
});
