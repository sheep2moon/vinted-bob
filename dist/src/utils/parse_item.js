export const parseItem = (item) => {
    console.log(item);
    if (item.id) {
        const parsedItem = {
            id: item.id,
            title: item.title,
            price: item.total_item_price,
            brand_title: item.brand_dto.title,
            username: item.user.login,
            description: item.description,
            photo_urls: item.photos.map((photo) => photo.url),
            size: item.size_title || "brak",
            status: item.status,
            post_url: item.url
        };
        return parsedItem;
    }
};
// photo_details: {
//     id: item.photo.id,
//     height: item.photo.height,
//     width: item.photo.width,
//     url: item.photo.url,
//     fullSizeUrl: item.photo.full_size_url,
//     imageNo: item.photo.image_no
// }
// photo_details: {
//     id: number;
//     imageNo: number;
//     width: number;
//     height: number;
//     url: string;
//     fullSizeUrl: string;
// };
