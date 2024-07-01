import { removeBrandFromBrandsFile } from "./../brands_data.js";
import dotenv from "dotenv";
import { GlobalSettingsModel } from "../database.js";
import { SocksProxyAgent } from "socks-proxy-agent";
import { addNewBrandToBrandsFile, getBrandsListFromFile } from "../brands_data.js";
import { getCookie } from "../services/cookie_service.js";
import { fetchCatalogItems, fetchCustomCatalogItems, findHighestId } from "../services/vinted_service.js";
dotenv.config();

export interface IConfig {
    brands: Brand[];
    min_price: number;
    max_price: number;
    dev_mode: boolean;
    current_highest_id: number;
    cookie: string;
    custom_search: {
        current_highest_id: number;
        url: string;
        keywords: string[];
    };
    discordConfig: {
        client_id: string;
        token: string;
        admin_id: string;
        guild_id: string;
    };
    proxyConfig: {
        host: string;
        port: number;
        username: string;
        password: string;
    };
}

export class ConfigManager implements IConfig {
    brands: Brand[];
    brands_list: Brand[];
    dev_mode: boolean;
    min_price: number;
    current_highest_id: number;
    cookie: string;
    max_price: number;
    custom_search: {
        current_highest_id: number;
        url: string;
        keywords: string[];
    };
    discordConfig: {
        client_id: string;
        token: string;
        admin_id: string;
        guild_id: string;
    };
    proxyConfig: {
        host: string;
        port: number;
        username: string;
        password: string;
    };

    constructor(data: IConfig) {
        Object.assign(this, data);
    }

    public setCurrentHighestId(id: number) {
        this.current_highest_id = id;
    }

    setCustomSearchCurrentHighestId(id: number) {
        this.custom_search.current_highest_id = id;
    }

    async addBrand(brand: Brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(this.discordConfig.guild_id) }, { $addToSet: { brands: brand.id } });
        this.brands.push(brand);
    }
    async deleteBrand(brand: Brand) {
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
            } catch (error) {
                // Logger.debug('Error fetching cookie');
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
    }

    async updateCustomSearchUrl(url: string) {
        this.custom_search.url = url;
        await GlobalSettingsModel.updateOne({ id: this.discordConfig.guild_id }, { custom_search: { url, keywords: this.custom_search.keywords } });
    }
    async updateCustomSearchKeywords(keywords: string[]) {
        this.custom_search.keywords = keywords;
        await GlobalSettingsModel.updateOne({ id: this.discordConfig.guild_id }, { custom_search: { url: this.custom_search.url, keywords } });
    }

    async updateMinPrice(minPrice: number) {
        this.min_price = minPrice;
        await GlobalSettingsModel.updateOne({ id: this.discordConfig.guild_id }, { max_price: minPrice });
    }
    async updateMaxPrice(maxPrice: number) {
        this.max_price = maxPrice;
        await GlobalSettingsModel.updateOne({ id: this.discordConfig.guild_id }, { max_price: maxPrice });
    }
    public getProxyAgent() {
        const proxyURI = `socks://${this.proxyConfig.username}:${this.proxyConfig.password}@${this.proxyConfig.host}:${this.proxyConfig.port}`;
        const agent = new SocksProxyAgent(proxyURI);
        return agent;
    }

    public async addNewBrandToList(newBrand: Brand) {
        const newBrandsList = await addNewBrandToBrandsFile(newBrand);
        if (newBrandsList) {
            this.brands_list = newBrandsList;
        }
    }
    public async removeBrandFromList(brand: Brand) {
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
        const catalog_items = await fetchCatalogItems();
        this.current_highest_id = findHighestId(catalog_items.items);
        const custom_search_items = await fetchCustomCatalogItems();
        this.custom_search.current_highest_id = findHighestId(custom_search_items.items);

        let settings = await GlobalSettingsModel.findOne({ id: this.discordConfig.guild_id });
        const brandsList = await getBrandsListFromFile();
        this.brands_list = brandsList;
        if (!settings) {
            await GlobalSettingsModel.create({
                id: this.discordConfig.guild_id,
                min_price: 1,
                max_price: 9999,
                brands: this.brands_list.map(brand => brand.id),
                custom_search: {
                    url: "",
                    keywords: [""]
                }
            });
            settings = await GlobalSettingsModel.findOne({ id: this.discordConfig.guild_id });
        }
        const activeBrands = this.brands_list.filter(brand => settings?.brands.includes(brand.id));
        this.brands = activeBrands;
        this.min_price = settings?.min_price || 0;
        this.max_price = settings?.max_price || 9999;
        this.custom_search.url = settings?.custom_search.url || "";
        this.custom_search.keywords = settings?.custom_search.keywords || [""];
    }
}
