import { readFile, writeFile } from "fs/promises";
import { Logger } from "./utils/logger.js";

const brandsFilePath = "brands.json";

export const getBrandsListFromFile = async (): Promise<Brand[]> => {
    const brandsData: Brand[] = JSON.parse(await readFile(brandsFilePath, "utf-8"));
    return brandsData;
};

export const addNewBrandToBrandsFile = async (brand: Brand) => {
    const brands = await getBrandsListFromFile();
    brands.push(brand);
    try {
        await writeFile(brandsFilePath, JSON.stringify(brands, null, 2), "utf-8");
        return brands;
    } catch (error) {
        Logger.error(`Error writing brands.json, ${error}`);
    }
};
