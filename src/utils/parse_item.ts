export type VintedItem = {
    id: number;
    title: string;
    price: number;
    brand_title: string;
    username: string;
    photo_urls: string[];
    size: string;
    status: string;
    post_url: string;
    description: string;
};

export const parseItem = (item: any) => {
    console.log(item);

    if (item.id) {
        const parsedItem: VintedItem = {
            id: item.id,
            title: item.title,
            price: item.total_item_price,
            brand_title: item.brand_dto.title,
            username: item.user.login,
            description: item.description,
            photo_urls: item.photos.map((photo: any) => photo.url),
            size: item.size_title || "brak",
            status: item.status,
            post_url: item.url
        };
        return parsedItem;
    }
};
