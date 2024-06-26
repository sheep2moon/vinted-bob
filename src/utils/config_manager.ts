import dotenv from "dotenv";
import { Brand, GlobalSettingsModel, brandsData } from "../database.js";
import { SocksProxyAgent } from "socks-proxy-agent";
dotenv.config();

export type Config = {
    brands: Brand[];
    min_price: number;
    max_price: number;
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

class ConfigManager {
    public brands: Brand[];
    public min_price: number;
    public max_price: number;
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

    async addBrand(brand: Brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(Configuration.discordConfig.guild_id) }, { $addToSet: { brands: brand.id } });
        this.brands.push(brand);
    }
    async deleteBrand(brand: Brand) {
        await GlobalSettingsModel.updateOne({ id: parseInt(Configuration.discordConfig.guild_id) }, { $pull: { brands: brand.id } });
        this.brands = [...this.brands.filter(b => b.id !== brand.id)];
    }

    // async updateBrands(brands: Brand[]) {
    //     this.brands = brands;
    // }
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

    async populateData() {
        let settings = await GlobalSettingsModel.findOne({ id: Configuration.discordConfig.guild_id });
        if (!settings) {
            await GlobalSettingsModel.create({
                id: Configuration.discordConfig.guild_id,
                min_price: 1,
                max_price: 9999,
                brands: brandsData.map(brand => brand.id)
            });
            settings = await GlobalSettingsModel.findOne({ id: Configuration.discordConfig.guild_id });
        }
        const activeBrands = brandsData.filter(brand => settings?.brands.includes(brand.id));
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
    }
});