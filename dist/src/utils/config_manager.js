import { removeBrandFromBrandsFile } from "./../brands_data.js";
import dotenv from "dotenv";
import { GlobalSettingsModel } from "../database.js";
import { SocksProxyAgent } from "socks-proxy-agent";
import { addNewBrandToBrandsFile, getBrandsListFromFile } from "../brands_data.js";
import { getCookie } from "../services/cookie_service.js";
import { fetchCatalogItems, findHighestId } from "../services/vinted_service.js";
dotenv.config();
export class ConfigManager {
    brands;
    brands_list;
    dev_mode;
    min_price;
    current_highest_id;
    cookie;
    max_price;
    custom_search;
    discordConfig;
    proxyConfig;
    constructor(data) {
        Object.assign(this, data);
    }
    setCurrentHighestId(id) {
        this.current_highest_id = id;
    }
    async addBrand(brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(this.discordConfig.guild_id) }, { $addToSet: { brands: brand.id } });
        this.brands.push(brand);
    }
    async deleteBrand(brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(this.discordConfig.guild_id) }, { $pull: { brands: brand.id } });
        this.brands = [...this.brands.filter(b => b.id !== brand.id)];
    }
    async refreshCookie() {
        let found = false;
        while (!found) {
            try {
                const cookie = await getCookie();
                if (cookie) {
                    found = true;
                    this.cookie = cookie;
                }
            }
            catch (error) {
                // Logger.debug('Error fetching cookie');
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }
    async updateMinPrice(minPrice) {
        this.min_price = minPrice;
        await GlobalSettingsModel.updateOne({ id: this.discordConfig.guild_id }, { max_price: minPrice });
    }
    async updateMaxPrice(maxPrice) {
        this.max_price = maxPrice;
        await GlobalSettingsModel.updateOne({ id: this.discordConfig.guild_id }, { max_price: maxPrice });
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
    async removeBrandFromList(brand) {
        const newBrandsList = await removeBrandFromBrandsFile(brand.key);
        if (newBrandsList) {
            this.brands_list = newBrandsList;
        }
        if (this.brands.find(b => b.id === brand.id)) {
            this.deleteBrand(brand);
        }
    }
    async Init() {
        await this.refreshCookie();
        const { items } = await fetchCatalogItems(this.cookie);
        this.current_highest_id = findHighestId(items);
        let settings = await GlobalSettingsModel.findOne({ id: this.discordConfig.guild_id });
        const brandsList = await getBrandsListFromFile();
        this.brands_list = brandsList;
        if (!settings) {
            await GlobalSettingsModel.create({
                id: this.discordConfig.guild_id,
                min_price: 1,
                max_price: 9999,
                brands: this.brands_list.map(brand => brand.id)
            });
            settings = await GlobalSettingsModel.findOne({ id: this.discordConfig.guild_id });
        }
        const activeBrands = this.brands_list.filter(brand => settings?.brands.includes(brand.id));
        this.brands = activeBrands;
        this.min_price = settings?.min_price || 0;
        this.max_price = settings?.max_price || 9999;
    }
}
