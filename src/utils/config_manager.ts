import { removeBrandFromBrandsFile } from "./../brands_data.js";
import dotenv from "dotenv";
import { GlobalSettingsModel } from "../database.js";
import { SocksProxyAgent } from "socks-proxy-agent";
import { addNewBrandToBrandsFile, getBrandsListFromFile } from "../brands_data.js";
import { getCookie } from "../services/cookie_service.js";
import { fetchCatalogItems, findHighestId } from "../services/vinted_service.js";
dotenv.config();

export type Config = {
    brands: Brand[];
    min_price: number;
    max_price: number;
    dev_mode: boolean;
    current_highest_id: number;
    cookie: string;
    custom_search: {
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
};

class ConfigManager<Config> {
    public brands: Brand[];
    public brands_list: Brand[];
    public dev_mode: boolean;
    public min_price: number;
    public current_highest_id: number;
    public cookie: string;
    public max_price: number;
    public custom_search: {
        url: string;
        keywords: string[];
    };
    public discordConfig: {
        client_id: string;
        token: string;
        admin_id: string;
        guild_id: string;
    };
    public proxyConfig: {
        host: string;
        port: number;
        username: string;
        password: string;
    };

    constructor(data: Config) {
        Object.assign(this, data);
    }

    public setCurrentHighestId(id: number) {
        this.current_highest_id = id;
    }

    async addBrand(brand: Brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(Configuration.discordConfig.guild_id) }, { $addToSet: { brands: brand.id } });
        this.brands.push(brand);
    }
    async deleteBrand(brand: Brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(Configuration.discordConfig.guild_id) }, { $pull: { brands: brand.id } });
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

    async updateMinPrice(minPrice: number) {
        this.min_price = minPrice;
        await GlobalSettingsModel.updateOne({ id: Configuration.discordConfig.guild_id }, { max_price: minPrice });
    }
    async updateMaxPrice(maxPrice: number) {
        this.max_price = maxPrice;
        await GlobalSettingsModel.updateOne({ id: Configuration.discordConfig.guild_id }, { max_price: maxPrice });
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
        const { items } = await fetchCatalogItems(Configuration.cookie);
        this.current_highest_id = findHighestId(items);
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

export const Configuration: ConfigManager<Config> = new ConfigManager({
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
    dev_mode: process.env.DEV_MODE ? true : false,
    custom_search: {
        url: "",
        keywords: []
    }
});
